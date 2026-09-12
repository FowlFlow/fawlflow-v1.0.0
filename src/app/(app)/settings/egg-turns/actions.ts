"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";
import type { Translate } from "@/lib/i18n/translate";

function buildTurnSchema(t: Translate) {
  return z.object({
    id: z.string().optional(),
    name: z.string().trim().min(1, t("settings.eggTurns.errors.nameRequired")).max(50),
    sortOrder: z.coerce.number().int(),
  });
}

export type TurnFormState = { error?: string };

export async function saveTurnAction(
  _prevState: TurnFormState,
  formData: FormData,
): Promise<TurnFormState> {
  const { t } = await getT();
  const turnSchema = buildTurnSchema(t);
  const parsed = turnSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? t("settings.eggTurns.errors.checkForm"),
    };
  }

  const { id, name, sortOrder } = parsed.data;

  if (id) {
    await prisma.eggTurn.update({ where: { id }, data: { name, sortOrder } });
  } else {
    const existing = await prisma.eggTurn.findUnique({ where: { name } });
    if (existing) {
      return { error: t("settings.eggTurns.errors.duplicateName") };
    }
    await prisma.eggTurn.create({ data: { name, sortOrder } });
  }

  revalidatePath("/settings/egg-turns");
  revalidatePath("/eggs/log");
  redirect(
    `/settings/egg-turns?flash=${encodeURIComponent(id ? t("settings.eggTurns.flash.updated") : t("settings.eggTurns.flash.added"))}`,
  );
}

export async function deactivateEggTurnAction(id: string): Promise<void> {
  const turn = await prisma.eggTurn.findUnique({ where: { id } });
  if (!turn || !turn.isActive) return;

  await prisma.eggTurn.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/settings/egg-turns");
  revalidatePath("/eggs/log");
}
