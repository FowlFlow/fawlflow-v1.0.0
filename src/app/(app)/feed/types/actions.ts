"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";
import type { Translate } from "@/lib/i18n/translate";

function buildFeedTypeSchema(t: Translate) {
  return z.object({
    id: z.string().optional(),
    nameEn: z.string().trim().min(1, t("feed.materials.nameEnRequired")).max(100),
    nameSi: z.string().trim().max(100).optional(),
    batchSizeKg: z.coerce.number().positive(t("feed.types.batchSizePositive")),
    defaultSellPricePerKg: z.coerce.number().min(0),
  });
}

const ingredientSchema = z.object({
  materialId: z.string().min(1),
  quantityPerBatchKg: z.coerce.number().positive(),
});

export type FeedTypeFormState = { error?: string };

export async function saveFeedTypeAction(
  _prevState: FeedTypeFormState,
  formData: FormData,
): Promise<FeedTypeFormState> {
  const { t } = await getT();
  const parsed = buildFeedTypeSchema(t).safeParse({
    id: formData.get("id") || undefined,
    nameEn: formData.get("nameEn"),
    nameSi: formData.get("nameSi") || undefined,
    batchSizeKg: formData.get("batchSizeKg"),
    defaultSellPricePerKg: formData.get("defaultSellPricePerKg") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("feed.common.checkForm") };
  }

  const materialIds = formData.getAll("materialId[]");
  const quantities = formData.getAll("quantityPerBatchKg[]");

  const ingredients: { materialId: string; quantityPerBatchKg: number }[] = [];
  for (let i = 0; i < materialIds.length; i++) {
    const parsedIngredient = ingredientSchema.safeParse({
      materialId: materialIds[i],
      quantityPerBatchKg: quantities[i],
    });
    if (parsedIngredient.success) {
      ingredients.push(parsedIngredient.data);
    }
  }

  if (ingredients.length === 0) {
    return { error: t("feed.types.addIngredientValidation") };
  }

  const materialIdSet = new Set(ingredients.map((i) => i.materialId));
  if (materialIdSet.size !== ingredients.length) {
    return { error: t("feed.types.uniqueIngredient") };
  }

  const { id, nameEn, nameSi, batchSizeKg, defaultSellPricePerKg } = parsed.data;

  await prisma.$transaction(async (tx) => {
    let feedTypeId = id;

    if (feedTypeId) {
      await tx.feedType.update({
        where: { id: feedTypeId },
        data: {
          nameEn,
          nameSi: nameSi || nameEn,
          batchSizeKg,
          defaultSellPricePerKg,
        },
      });
    } else {
      const created = await tx.feedType.create({
        data: {
          nameEn,
          nameSi: nameSi || nameEn,
          batchSizeKg,
          defaultSellPricePerKg,
        },
      });
      feedTypeId = created.id;
    }

    const existingItems = await tx.feedRecipeItem.findMany({
      where: { feedTypeId, deletedAt: null },
    });
    const submittedIds = new Set(ingredients.map((i) => i.materialId));

    for (const item of existingItems) {
      if (!submittedIds.has(item.materialId)) {
        await tx.feedRecipeItem.update({
          where: { id: item.id },
          data: { deletedAt: new Date() },
        });
      }
    }

    for (const ingredient of ingredients) {
      const active = existingItems.find(
        (item) => item.materialId === ingredient.materialId,
      );
      if (active) {
        await tx.feedRecipeItem.update({
          where: { id: active.id },
          data: { quantityPerBatchKg: ingredient.quantityPerBatchKg },
        });
        continue;
      }

      const deletedMatch = await tx.feedRecipeItem.findFirst({
        where: {
          feedTypeId,
          materialId: ingredient.materialId,
          deletedAt: { not: null },
        },
      });

      if (deletedMatch) {
        await tx.feedRecipeItem.update({
          where: { id: deletedMatch.id },
          data: {
            deletedAt: null,
            quantityPerBatchKg: ingredient.quantityPerBatchKg,
          },
        });
      } else {
        await tx.feedRecipeItem.create({
          data: {
            feedTypeId,
            materialId: ingredient.materialId,
            quantityPerBatchKg: ingredient.quantityPerBatchKg,
          },
        });
      }
    }
  });

  revalidatePath("/feed/types");
  redirect(
    `/feed/types?flash=${encodeURIComponent(id ? t("feed.types.updated") : t("feed.types.added"))}`,
  );
}
