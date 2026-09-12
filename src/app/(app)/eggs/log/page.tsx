import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EggLogForm } from "./egg-log-form";
import { SectionNav } from "@/components/section-nav";

const NAV_ITEMS = [
  { href: "/eggs/cages", label: "Cages" },
  { href: "/eggs/log", label: "Log Eggs" },
];

export default async function EggLogPage(props: PageProps<"/eggs/log">) {
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
      <SectionNav items={NAV_ITEMS} backHref="/eggs" backLabel="Eggs" />
      <h1 className="text-xl font-bold">Log Eggs</h1>

      {cages.length === 0 ? (
        <p className="text-muted-foreground">
          No cages yet.{" "}
          <Link href="/eggs/cages/new" className="underline">
            Add one first
          </Link>
          .
        </p>
      ) : turns.length === 0 ? (
        <p className="text-muted-foreground">No egg turns configured yet.</p>
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
