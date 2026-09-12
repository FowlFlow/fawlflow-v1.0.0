"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRawMaterialStockKg, getLatestUnitCost } from "@/lib/stock";
import { getT } from "@/lib/i18n/server";

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
  const { t } = await getT();

  const produceBatchSchema = z.object({
    feedTypeId: z.string().min(1, t("common.select", { item: t("feed.common.feedType") })),
    date: z.string().min(1, t("feed.common.dateRequired")),
    quantityProducedKg: z.coerce.number().positive(t("feed.common.quantityPositive")),
    notes: z.string().trim().max(300).optional(),
    confirmed: z.coerce.boolean().optional(),
  });

  const parsed = produceBatchSchema.safeParse({
    feedTypeId: formData.get("feedTypeId"),
    date: formData.get("date"),
    quantityProducedKg: formData.get("quantityProducedKg"),
    notes: formData.get("notes") || undefined,
    confirmed: formData.get("confirmed") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("feed.common.checkForm") };
  }

  const { feedTypeId, date, quantityProducedKg, notes, confirmed } = parsed.data;

  const feedType = await prisma.feedType.findUnique({ where: { id: feedTypeId } });
  if (!feedType) return { error: t("feed.common.feedTypeNotFound") };

  const recipeItems = await prisma.feedRecipeItem.findMany({
    where: { feedTypeId, deletedAt: null },
    include: { material: true },
  });
  if (recipeItems.length === 0) {
    return { error: t("feed.production.noIngredients") };
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
      error: t("feed.production.noPurchaseHistory", { name: missingCost.materialName }),
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
  redirect(`/feed/production?flash=${encodeURIComponent(t("feed.production.produced"))}`);
}
