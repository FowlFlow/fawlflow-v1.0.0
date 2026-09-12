"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";

export type EggLogFormState = { error?: string; savedAt?: number };

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

  const entries: { cageId: string; turnId: string; eggCount: number }[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("cell:")) continue;
    const [, cageId, turnId] = key.split(":");
    if (!cageIds.has(cageId) || !turnIds.has(turnId)) continue;
    if (typeof value !== "string" || value.trim() === "") continue;

    const eggCount = Number(value);
    if (!Number.isFinite(eggCount) || eggCount < 0) continue;

    entries.push({ cageId, turnId, eggCount: Math.round(eggCount) });
  }

  if (entries.length === 0) {
    return { error: t("eggs.log.enterAtLeastOne") };
  }

  // Every submission creates fresh rows — re-logging the same cage/turn/date
  // adds another entry instead of silently overwriting a previous one, so a
  // mistaken entry stays visible (and editable/deletable) rather than lost.
  await prisma.eggCollection.createMany({
    data: entries.map((e) => ({
      cageId: e.cageId,
      turnId: e.turnId,
      date: parsedDate,
      eggCount: e.eggCount,
    })),
  });

  revalidatePath("/eggs/log");
  revalidatePath("/eggs/reports");
  return { savedAt: Date.now() };
}

export type EggEntryFormState = { error?: string };

export async function updateEggEntryAction(
  _prevState: EggEntryFormState,
  formData: FormData,
): Promise<EggEntryFormState> {
  const { t } = await getT();
  const id = formData.get("id");
  const cageId = formData.get("cageId");
  const turnId = formData.get("turnId");
  const date = formData.get("date");
  const eggCount = Number(formData.get("eggCount"));
  const crackedCount = Number(formData.get("crackedCount") || 0);

  if (
    typeof id !== "string" ||
    typeof cageId !== "string" ||
    !cageId ||
    typeof turnId !== "string" ||
    !turnId ||
    typeof date !== "string" ||
    !date
  ) {
    return { error: t("eggs.log.missingDate") };
  }
  if (
    !Number.isFinite(eggCount) ||
    eggCount < 0 ||
    !Number.isFinite(crackedCount) ||
    crackedCount < 0
  ) {
    return { error: t("eggs.log.invalidCounts") };
  }

  const existing = await prisma.eggCollection.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    return { error: t("eggs.log.notFound") };
  }

  await prisma.eggCollection.update({
    where: { id },
    data: {
      cageId,
      turnId,
      date: new Date(date),
      eggCount: Math.round(eggCount),
      crackedCount: Math.round(crackedCount),
    },
  });

  revalidatePath("/eggs/log");
  revalidatePath("/eggs/reports");
  redirect(`/eggs/log?date=${date}&flash=${encodeURIComponent(t("eggs.log.updated"))}`);
}

export async function deleteEggEntryAction(id: string): Promise<void> {
  const entry = await prisma.eggCollection.findUnique({ where: { id } });
  if (!entry || entry.deletedAt) return;

  await prisma.eggCollection.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/eggs/log");
  revalidatePath("/eggs/reports");
}
