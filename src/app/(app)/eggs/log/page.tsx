import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EggLogForm } from "./egg-log-form";
import { SectionNav } from "@/components/section-nav";
import { getT } from "@/lib/i18n/server";

export default async function EggLogPage(props: PageProps<"/eggs/log">) {
  const { t } = await getT();
  const navItems = [
    { href: "/eggs/cages", label: t("eggs.cages.title") },
    { href: "/eggs/log", label: t("eggs.log.title") },
  ];
  const searchParams = await props.searchParams;
  const dateParam = typeof searchParams.date === "string" ? searchParams.date : undefined;
  const today = new Date().toISOString().slice(0, 10);
  const selectedDate = dateParam ?? today;

  const [cages, turns, existingEntries] = await Promise.all([
    prisma.cage.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.eggTurn.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.eggCollection.findMany({
      where: { date: new Date(selectedDate), deletedAt: null },
    }),
  ]);

  const existing: Record<string, number> = {};
  for (const entry of existingEntries) {
    existing[`${entry.cageId}:${entry.turnId}`] = entry.eggCount;
  }

  return (
    <div className="space-y-4">
      <SectionNav items={navItems} backHref="/eggs" backLabel={t("eggs.hub.title")} />
      <h1 className="text-xl font-bold">{t("eggs.log.title")}</h1>

      {cages.length === 0 ? (
        <p className="text-muted-foreground">
          {t("eggs.log.noCagesYet")}{" "}
          <Link href="/eggs/cages/new" className="underline">
            {t("eggs.log.addOneFirst")}
          </Link>
          .
        </p>
      ) : turns.length === 0 ? (
        <p className="text-muted-foreground">{t("eggs.log.noTurns")}</p>
      ) : (
        <EggLogForm
          cages={cages.map((cage) => ({ id: cage.id, name: cage.name }))}
          turns={turns.map((turn) => ({ id: turn.id, name: turn.name }))}
          date={selectedDate}
          existing={existing}
        />
      )}
    </div>
  );
}
