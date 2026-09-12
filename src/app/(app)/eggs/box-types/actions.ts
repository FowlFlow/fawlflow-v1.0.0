"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";
import type { Translate } from "@/lib/i18n/translate";

function boxTypeSchema(t: Translate) {
  return z.object({
    id: z.string().optional(),
    name: z
      .string()
      .trim()
      .min(1, `${t("common.name")} ${t("common.required")}`)
      .max(100),
    eggsPerBox: z.coerce
      .number()
      .int()
      .positive(t("eggs.validation.mustBeGreaterThanZero")),
  });
}

export type BoxTypeFormState = { error?: string };

export async function saveBoxTypeAction(
  _prevState: BoxTypeFormState,
  formData: FormData,
): Promise<BoxTypeFormState> {
  const { t } = await getT();
  const parsed = boxTypeSchema(t).safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    eggsPerBox: formData.get("eggsPerBox"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? t("eggs.validation.checkForm"),
    };
  }

  const { id, name, eggsPerBox } = parsed.data;

  if (id) {
    await prisma.eggBoxType.update({ where: { id }, data: { name, eggsPerBox } });
  } else {
    const existing = await prisma.eggBoxType.findUnique({ where: { name } });
    if (existing) {
      return { error: t("eggs.boxTypes.alreadyExists") };
    }
    await prisma.eggBoxType.create({ data: { name, eggsPerBox } });
  }

  revalidatePath("/eggs/box-types");
  redirect(
    `/eggs/box-types?flash=${encodeURIComponent(id ? t("eggs.boxTypes.updated") : t("eggs.boxTypes.added"))}`,
  );
}

export async function deactivateBoxTypeAction(id: string): Promise<void> {
  const boxType = await prisma.eggBoxType.findUnique({ where: { id } });
  if (!boxType || !boxType.isActive) return;

  await prisma.eggBoxType.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/eggs/box-types");
}
