"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";

export type MaterialFormState = { error?: string };

export async function saveMaterialAction(
  _prevState: MaterialFormState,
  formData: FormData,
): Promise<MaterialFormState> {
  const { t } = await getT();

  const materialSchema = z.object({
    id: z.string().optional(),
    nameEn: z.string().trim().min(1, t("feed.materials.nameEnRequired")).max(100),
    nameSi: z.string().trim().max(100).optional(),
    unit: z.enum(["KG", "TON"]),
    defaultSellPricePerKg: z.coerce.number().min(0),
  });

  const parsed = materialSchema.safeParse({
    id: formData.get("id") || undefined,
    nameEn: formData.get("nameEn"),
    nameSi: formData.get("nameSi") || undefined,
    unit: formData.get("unit"),
    defaultSellPricePerKg: formData.get("defaultSellPricePerKg") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("feed.common.checkForm") };
  }

  const { id, nameEn, nameSi, unit, defaultSellPricePerKg } = parsed.data;
  const data = { nameEn, nameSi: nameSi || nameEn, unit, defaultSellPricePerKg };

  if (id) {
    await prisma.rawMaterial.update({ where: { id }, data });
  } else {
    const existing = await prisma.rawMaterial.findUnique({ where: { nameEn } });
    if (existing) {
      return { error: t("feed.materials.duplicateName") };
    }
    await prisma.rawMaterial.create({ data });
  }

  revalidatePath("/feed/materials");
  redirect(
    `/feed/materials?flash=${encodeURIComponent(id ? t("feed.materials.updated") : t("feed.materials.added"))}`,
  );
}

export async function deactivateMaterialAction(id: string): Promise<void> {
  const material = await prisma.rawMaterial.findUnique({ where: { id } });
  if (!material || !material.isActive) return;

  await prisma.rawMaterial.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/feed/materials");
}
