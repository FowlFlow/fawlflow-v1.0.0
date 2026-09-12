"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getEggStockCount } from "@/lib/stock";

const eggSaleSchema = z.object({
  buyerId: z.string().min(1, "Select a buyer"),
  date: z.string().min(1, "Date is required"),
  boxTypeId: z.string().optional(),
  boxCount: z.coerce.number().int().min(0),
  looseEggCount: z.coerce.number().int().min(0),
  ratePerEgg: z.coerce.number().min(0),
  notes: z.string().trim().max(300).optional(),
  confirmed: z.coerce.boolean().optional(),
});

export type EggSaleFormState = {
  error?: string;
  needsConfirmation?: boolean;
  formValues?: {
    buyerId: string;
    date: string;
    boxTypeId?: string;
    boxCount: string;
    looseEggCount: string;
    ratePerEgg: string;
    notes?: string;
  };
  shortage?: {
    availableCount: number;
    requestedCount: number;
    resultingCount: number;
  };
};

export async function recordEggSaleAction(
  _prevState: EggSaleFormState,
  formData: FormData,
): Promise<EggSaleFormState> {
  const parsed = eggSaleSchema.safeParse({
    buyerId: formData.get("buyerId"),
    date: formData.get("date"),
    boxTypeId: formData.get("boxTypeId") || undefined,
    boxCount: formData.get("boxCount") || 0,
    looseEggCount: formData.get("looseEggCount") || 0,
    ratePerEgg: formData.get("ratePerEgg"),
    notes: formData.get("notes") || undefined,
    confirmed: formData.get("confirmed") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const {
    buyerId,
    date,
    boxTypeId,
    boxCount,
    looseEggCount,
    ratePerEgg,
    notes,
    confirmed,
  } = parsed.data;

  if (boxCount === 0 && looseEggCount === 0) {
    return { error: "Enter some boxes or some loose eggs." };
  }
  if (boxCount > 0 && !boxTypeId) {
    return { error: "Select a box type, or set box count to 0." };
  }

  const buyer = await prisma.contact.findUnique({ where: { id: buyerId } });
  if (!buyer) return { error: "Buyer not found." };

  let eggsPerBoxAtSale: number | null = null;
  if (boxTypeId) {
    const boxType = await prisma.eggBoxType.findUnique({ where: { id: boxTypeId } });
    if (!boxType) return { error: "Box type not found." };
    eggsPerBoxAtSale = boxType.eggsPerBox;
  }

  const totalEggCount = boxCount * (eggsPerBoxAtSale ?? 0) + looseEggCount;
  const totalAmount = totalEggCount * ratePerEgg;

  const availableCount = await getEggStockCount();
  const resultingCount = availableCount - totalEggCount;

  if (resultingCount < 0 && !confirmed) {
    return {
      needsConfirmation: true,
      formValues: {
        buyerId,
        date,
        boxTypeId,
        boxCount: boxCount.toString(),
        looseEggCount: looseEggCount.toString(),
        ratePerEgg: ratePerEgg.toString(),
        notes,
      },
      shortage: { availableCount, requestedCount: totalEggCount, resultingCount },
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.eggSale.create({
      data: {
        buyerId,
        date: new Date(date),
        boxTypeId: boxTypeId ?? null,
        boxCount,
        eggsPerBoxAtSale,
        looseEggCount,
        totalEggCount,
        ratePerEgg,
        totalAmount,
        notes,
      },
    });

    if (!buyer.isBuyer) {
      await tx.contact.update({ where: { id: buyerId }, data: { isBuyer: true } });
    }
  });

  revalidatePath("/eggs/reports");
  revalidatePath("/eggs/sales");
  redirect(`/eggs/sales?flash=${encodeURIComponent("Sale recorded.")}`);
}
