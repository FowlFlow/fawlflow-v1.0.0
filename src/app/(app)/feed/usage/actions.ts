"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getFeedStockKg } from "@/lib/stock";

const usageSchema = z.object({
  feedTypeId: z.string().min(1, "Select a feed type"),
  date: z.string().min(1, "Date is required"),
  quantityKg: z.coerce.number().positive("Quantity must be greater than 0"),
  notes: z.string().trim().max(300).optional(),
  confirmed: z.coerce.boolean().optional(),
});

export type UsageFormState = {
  error?: string;
  needsConfirmation?: boolean;
  formValues?: { feedTypeId: string; date: string; quantityKg: string; notes?: string };
  shortage?: {
    itemName: string;
    availableKg: number;
    requestedKg: number;
    resultingKg: number;
  };
};

export async function logFeedUsageAction(
  _prevState: UsageFormState,
  formData: FormData,
): Promise<UsageFormState> {
  const parsed = usageSchema.safeParse({
    feedTypeId: formData.get("feedTypeId"),
    date: formData.get("date"),
    quantityKg: formData.get("quantityKg"),
    notes: formData.get("notes") || undefined,
    confirmed: formData.get("confirmed") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const { feedTypeId, date, quantityKg, notes, confirmed } = parsed.data;

  const feedType = await prisma.feedType.findUnique({ where: { id: feedTypeId } });
  if (!feedType) return { error: "Feed type not found." };

  const availableKg = await getFeedStockKg(feedTypeId);
  const resultingKg = availableKg - quantityKg;

  if (resultingKg < 0 && !confirmed) {
    return {
      needsConfirmation: true,
      formValues: { feedTypeId, date, quantityKg: quantityKg.toString(), notes },
      shortage: {
        itemName: feedType.nameEn,
        availableKg,
        requestedKg: quantityKg,
        resultingKg,
      },
    };
  }

  await prisma.feedUsage.create({
    data: { feedTypeId, date: new Date(date), quantityKg, notes },
  });

  revalidatePath("/feed/materials");
  revalidatePath("/feed/types");
  revalidatePath("/feed/usage");
  redirect(`/feed/usage?flash=${encodeURIComponent("Farm use logged.")}`);
}
