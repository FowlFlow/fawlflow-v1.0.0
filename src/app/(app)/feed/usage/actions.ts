"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getFeedStockKg } from "@/lib/stock";
import { getT } from "@/lib/i18n/server";
import type { Translate } from "@/lib/i18n/translate";

function buildUsageSchema(t: Translate) {
  return z.object({
    feedTypeId: z.string().min(1, t("feed.usage.selectFeedType")),
    date: z.string().min(1, t("feed.common.dateRequired")),
    quantityKg: z.coerce.number().positive(t("feed.common.quantityPositive")),
    notes: z.string().trim().max(300).optional(),
    confirmed: z.coerce.boolean().optional(),
  });
}

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
  const { t } = await getT();
  const parsed = buildUsageSchema(t).safeParse({
    feedTypeId: formData.get("feedTypeId"),
    date: formData.get("date"),
    quantityKg: formData.get("quantityKg"),
    notes: formData.get("notes") || undefined,
    confirmed: formData.get("confirmed") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("feed.common.checkForm") };
  }

  const { feedTypeId, date, quantityKg, notes, confirmed } = parsed.data;

  const feedType = await prisma.feedType.findUnique({ where: { id: feedTypeId } });
  if (!feedType) return { error: t("feed.common.feedTypeNotFound") };

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
  redirect(`/feed/usage?flash=${encodeURIComponent(t("feed.usage.logged"))}`);
}

// Edits skip the shortage-confirmation dance that new entries go through —
// that warning only matters when a NEW entry would push stock negative; for
// an existing entry we just validate and save the change in place.
export async function updateFeedUsageAction(
  _prevState: UsageFormState,
  formData: FormData,
): Promise<UsageFormState> {
  const { t } = await getT();

  const updateUsageSchema = z.object({
    id: z.string().min(1),
    feedTypeId: z.string().min(1, t("feed.usage.selectFeedType")),
    date: z.string().min(1, t("feed.common.dateRequired")),
    quantityKg: z.coerce.number().positive(t("feed.common.quantityPositive")),
    notes: z.string().trim().max(300).optional(),
  });

  const parsed = updateUsageSchema.safeParse({
    id: formData.get("id"),
    feedTypeId: formData.get("feedTypeId"),
    date: formData.get("date"),
    quantityKg: formData.get("quantityKg"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("feed.common.checkForm") };
  }

  const { id, feedTypeId, date, quantityKg, notes } = parsed.data;

  const existingUsage = await prisma.feedUsage.findUnique({ where: { id } });
  if (!existingUsage || existingUsage.deletedAt) {
    return { error: t("feed.usage.notFound") };
  }

  const feedType = await prisma.feedType.findUnique({ where: { id: feedTypeId } });
  if (!feedType) return { error: t("feed.common.feedTypeNotFound") };

  await prisma.feedUsage.update({
    where: { id },
    data: { feedTypeId, date: new Date(date), quantityKg, notes },
  });

  revalidatePath("/feed/materials");
  revalidatePath("/feed/types");
  revalidatePath("/feed/usage");
  redirect(`/feed/usage?flash=${encodeURIComponent(t("feed.usage.updated"))}`);
}

export async function deleteFeedUsageAction(id: string): Promise<void> {
  const usage = await prisma.feedUsage.findUnique({ where: { id } });
  if (!usage || usage.deletedAt) return;

  await prisma.feedUsage.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/feed/materials");
  revalidatePath("/feed/types");
  revalidatePath("/feed/usage");
}
