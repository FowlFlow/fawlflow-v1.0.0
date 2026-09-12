"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";

export type EggLogFormState = { error?: string; success?: boolean };

export async function saveEggLogAction(
  _prevState: EggLogFormState,
  formData: FormData,
): Promise<EggLogFormState> {
  const { t } = await getT();
  const date = formData.get("date");
  if (typeof date !== "string" || !date) {
    return { error: t("eggs.log.missingDate") };
  }
  const parsedDate = new Date(date);

  const [cages, turns] = await Promise.all([
    prisma.cage.findMany({ where: { isActive: true }, select: { id: true } }),
    prisma.eggTurn.findMany({ where: { isActive: true }, select: { id: true } }),
  ]);
  const cageIds = new Set(cages.map((c) => c.id));
  const turnIds = new Set(turns.map((turn) => turn.id));

  const updates: { cageId: string; turnId: string; eggCount: number }[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("cell:")) continue;
    const [, cageId, turnId] = key.split(":");
    if (!cageIds.has(cageId) || !turnIds.has(turnId)) continue;
    if (typeof value !== "string" || value.trim() === "") continue;

    const eggCount = Number(value);
    if (!Number.isFinite(eggCount) || eggCount < 0) continue;

    updates.push({ cageId, turnId, eggCount: Math.round(eggCount) });
  }

  if (updates.length === 0) {
    return { error: t("eggs.log.enterAtLeastOne") };
  }

  await prisma.$transaction(
    updates.map((u) =>
      prisma.eggCollection.upsert({
        where: {
          cageId_turnId_date: { cageId: u.cageId, turnId: u.turnId, date: parsedDate },
        },
        update: { eggCount: u.eggCount, deletedAt: null },
        create: {
          cageId: u.cageId,
          turnId: u.turnId,
          date: parsedDate,
          eggCount: u.eggCount,
        },
      }),
    ),
  );

  revalidatePath("/eggs/log");
  revalidatePath("/eggs/reports");
  return { success: true };
}
