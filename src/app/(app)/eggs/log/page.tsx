import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EggLogForm } from "./egg-log-form";
import { SectionNav } from "@/components/section-nav";
import { DeleteButton } from "@/components/delete-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";
import { deleteEggEntryAction } from "./actions";

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
      include: { cage: true, turn: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

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
        />
      )}

      <div className="space-y-3 pt-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t("eggs.log.entriesForDate", { date: selectedDate })}
        </h2>
        {existingEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("eggs.log.noEntriesYet")}</p>
        ) : (
          <div className="space-y-2">
            {existingEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div className="text-sm">
                  <p className="font-medium">
                    {entry.cage.name}
                    <span className="text-muted-foreground"> · {entry.turn.name}</span>
                  </p>
                  <p className="text-muted-foreground">
                    {t("eggs.log.eggsColumn")}: {entry.eggCount}
                    {entry.crackedCount > 0 &&
                      ` · ${t("eggs.log.crackedColumn")}: ${entry.crackedCount}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/eggs/log/${entry.id}/edit?date=${selectedDate}`}
                    aria-label={t("eggs.log.editAria")}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon-lg" }),
                      "text-muted-foreground",
                    )}
                  >
                    <Pencil />
                  </Link>
                  <DeleteButton
                    action={deleteEggEntryAction.bind(null, entry.id)}
                    confirmMessage={t("common.confirmDelete")}
                    label={t("eggs.log.deleteAria")}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
