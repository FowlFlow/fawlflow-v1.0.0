"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRawMaterialStockKg, getLatestUnitCost } from "@/lib/stock";

const produceBatchSchema = z.object({
  feedTypeId: z.string().min(1, "Select a feed type"),
  date: z.string().min(1, "Date is required"),
  quantityProducedKg: z.coerce.number().positive("Quantity must be greater than 0"),
  notes: z.string().trim().max(300).optional(),
  confirmed: z.coerce.boolean().optional(),
});

export type ProduceBatchState = {
  error?: string;
  needsConfirmation?: boolean;
  formValues?: {
    feedTypeId: string;
    date: string;
    quantityProducedKg: string;
    notes?: string;
  };
  shortages?: {
    materialName: string;
    availableKg: number;
    requiredKg: number;
    resultingKg: number;
  }[];
};

export async function produceBatchAction(
  _prevState: ProduceBatchState,
  formData: FormData,
): Promise<ProduceBatchState> {
  const parsed = produceBatchSchema.safeParse({
    feedTypeId: formData.get("feedTypeId"),
    date: formData.get("date"),
    quantityProducedKg: formData.get("quantityProducedKg"),
    notes: formData.get("notes") || undefined,
    confirmed: formData.get("confirmed") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const { feedTypeId, date, quantityProducedKg, notes, confirmed } = parsed.data;

  const feedType = await prisma.feedType.findUnique({ where: { id: feedTypeId } });
  if (!feedType) return { error: "Feed type not found." };

  const recipeItems = await prisma.feedRecipeItem.findMany({
    where: { feedTypeId, deletedAt: null },
    include: { material: true },
  });
  if (recipeItems.length === 0) {
    return { error: "This recipe has no ingredients yet. Edit it and add some first." };
  }

  const scaleFactor = quantityProducedKg / feedType.batchSizeKg.toNumber();
  const productionDate = new Date(date);

  const lines = await Promise.all(
    recipeItems.map(async (item) => {
      const requiredKg = item.quantityPerBatchKg.toNumber() * scaleFactor;
      const availableKg = await getRawMaterialStockKg(item.materialId);
      const unitCostPerKg = await getLatestUnitCost(item.materialId, productionDate);
      return {
        materialId: item.materialId,
        materialName: item.material.nameEn,
        requiredKg,
        availableKg,
        resultingKg: availableKg - requiredKg,
        unitCostPerKg,
      };
    }),
  );

  const missingCost = lines.find((line) => line.unitCostPerKg === null);
  if (missingCost) {
    return {
      error: `No purchase history for ${missingCost.materialName} yet — record a purchase for it first so its cost is known.`,
    };
  }

  const shortages = lines.filter((line) => line.resultingKg < 0);

  if (shortages.length > 0 && !confirmed) {
    return {
      needsConfirmation: true,
      formValues: {
        feedTypeId,
        date,
        quantityProducedKg: quantityProducedKg.toString(),
        notes,
      },
      shortages: shortages.map((line) => ({
        materialName: line.materialName,
        availableKg: line.availableKg,
        requiredKg: line.requiredKg,
        resultingKg: line.resultingKg,
      })),
    };
  }

  await prisma.$transaction(async (tx) => {
    const batch = await tx.feedProductionBatch.create({
      data: {
        feedTypeId,
        date: productionDate,
        scaleFactor,
        quantityProducedKg,
        notes,
      },
    });

    for (const line of lines) {
      await tx.feedProductionConsumption.create({
        data: {
          productionId: batch.id,
          materialId: line.materialId,
          date: productionDate,
          quantityKg: line.requiredKg,
          unitCostPerKg: line.unitCostPerKg as number,
        },
      });
    }
  });

  revalidatePath("/feed/materials");
  revalidatePath("/feed/types");
  revalidatePath("/feed/production");
  redirect(`/feed/production?flash=${encodeURIComponent("Batch produced.")}`);
}
