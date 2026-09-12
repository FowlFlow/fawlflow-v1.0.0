import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { getT } from "@/lib/i18n/server";
import { EggEntryForm } from "./egg-entry-form";

export default async function EditEggEntryPage(
  props: PageProps<"/eggs/log/[id]/edit">,
) {
  const { t } = await getT();
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const backDate = typeof searchParams.date === "string" ? searchParams.date : undefined;

  const [entry, cages, turns] = await Promise.all([
    prisma.eggCollection.findUnique({ where: { id } }),
    prisma.cage.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.eggTurn.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!entry || entry.deletedAt) notFound();

  const backHref = backDate ? `/eggs/log?date=${backDate}` : "/eggs/log";

  return (
    <div className="space-y-4">
      <BackLink href={backHref} label={t("eggs.log.title")} />
      <h1 className="text-xl font-bold">{t("eggs.log.editTitle")}</h1>
      <EggEntryForm
        entry={{
          id: entry.id,
          cageId: entry.cageId,
          turnId: entry.turnId,
          date: entry.date.toISOString().slice(0, 10),
          eggCount: entry.eggCount,
          crackedCount: entry.crackedCount,
        }}
        cages={cages.map((c) => ({ id: c.id, name: c.name }))}
        turns={turns.map((t) => ({ id: t.id, name: t.name }))}
        backHref={backHref}
      />
    </div>
  );
}
