"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";
import type { Translate } from "@/lib/i18n/translate";

function cageSchema(t: Translate) {
  return z.object({
    id: z.string().optional(),
    name: z
      .string()
      .trim()
      .min(1, `${t("common.name")} ${t("common.required")}`)
      .max(100),
    currentChickenCount: z.coerce.number().int().min(0),
  });
}

export type CageFormState = { error?: string };

export async function saveCageAction(
  _prevState: CageFormState,
  formData: FormData,
): Promise<CageFormState> {
  const { t } = await getT();
  const parsed = cageSchema(t).safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    currentChickenCount: formData.get("currentChickenCount") || 0,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? t("eggs.validation.checkForm"),
    };
  }

  const { id, name, currentChickenCount } = parsed.data;

  if (id) {
    await prisma.cage.update({ where: { id }, data: { name, currentChickenCount } });
  } else {
    const farm = await prisma.farm.findFirst();
    if (!farm) return { error: t("eggs.cages.noFarm") };

    const existing = await prisma.cage.findFirst({ where: { farmId: farm.id, name } });
    if (existing) {
      return { error: t("eggs.cages.alreadyExists") };
    }

    await prisma.cage.create({
      data: { farmId: farm.id, name, currentChickenCount },
    });
  }

  revalidatePath("/eggs/cages");
  redirect(
    `/eggs/cages?flash=${encodeURIComponent(id ? t("eggs.cages.updated") : t("eggs.cages.added"))}`,
  );
}

export async function deactivateCageAction(id: string): Promise<void> {
  const cage = await prisma.cage.findUnique({ where: { id } });
  if (!cage || !cage.isActive) return;

  await prisma.cage.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/eggs/cages");
}
