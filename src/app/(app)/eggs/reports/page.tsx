import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionNav } from "@/components/section-nav";

const NAV_ITEMS = [{ href: "/eggs/reports", label: "Reports" }];

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return toISODate(d);
}

export default async function EggReportsPage(props: PageProps<"/eggs/reports">) {
  const searchParams = await props.searchParams;
  const today = toISODate(new Date());
  const from = typeof searchParams.from === "string" ? searchParams.from : addDays(today, -6);
  const to = typeof searchParams.to === "string" ? searchParams.to : today;

  const [cages, collections] = await Promise.all([
    prisma.cage.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.eggCollection.findMany({
      where: { date: { gte: new Date(from), lte: new Date(to) }, deletedAt: null },
    }),
  ]);

  const dates: string[] = [];
  for (let cursor = from; cursor <= to; cursor = addDays(cursor, 1)) {
    dates.push(cursor);
  }

  const sums = new Map<string, number>();
  for (const entry of collections) {
    const key = `${entry.cageId}:${toISODate(entry.date)}`;
    sums.set(key, (sums.get(key) ?? 0) + entry.eggCount);
  }

  const cageTotals = new Map<string, number>();
  const dateTotals = new Map<string, number>();
  let grandTotal = 0;

  for (const cage of cages) {
    for (const date of dates) {
      const value = sums.get(`${cage.id}:${date}`) ?? 0;
      cageTotals.set(cage.id, (cageTotals.get(cage.id) ?? 0) + value);
      dateTotals.set(date, (dateTotals.get(date) ?? 0) + value);
      grandTotal += value;
    }
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <SectionNav items={NAV_ITEMS} backHref="/eggs" backLabel="Eggs" />
      <h1 className="text-xl font-bold">Egg Report</h1>

      <form className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="from" className="mb-1 block text-sm font-medium">
            From
          </label>
          <input
            type="date"
            id="from"
            name="from"
            defaultValue={from}
            className="h-11 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div>
          <label htmlFor="to" className="mb-1 block text-sm font-medium">
            To
          </label>
          <input
            type="date"
            id="to"
            name="to"
            defaultValue={to}
            className="h-11 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <button
          type="submit"
          aria-label="Apply date range"
          className={cn(buttonVariants({ variant: "outline", size: "icon-lg" }))}
        >
          <Search />
        </button>
      </form>

      {cages.length === 0 ? (
        <p className="text-muted-foreground">No cages yet.</p>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="sticky top-0 z-10 border-b bg-muted">
                <th className="p-2 text-left font-medium">Cage</th>
                {dates.map((date) => (
                  <th key={date} className="p-2 text-right font-medium whitespace-nowrap">
                    {new Date(date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </th>
                ))}
                <th className="p-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {cages.map((cage) => (
                <tr key={cage.id} className="border-b last:border-0">
                  <td className="p-2 font-medium whitespace-nowrap">
                    {cage.name}
                  </td>
                  {dates.map((date) => (
                    <td key={date} className="p-2 text-right">
                      {sums.get(`${cage.id}:${date}`) ?? 0}
                    </td>
                  ))}
                  <td className="p-2 text-right font-semibold">
                    {cageTotals.get(cage.id) ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t bg-muted/50 font-semibold">
                <td className="p-2">Total</td>
                {dates.map((date) => (
                  <td key={date} className="p-2 text-right">
                    {dateTotals.get(date) ?? 0}
                  </td>
                ))}
                <td className="p-2 text-right">{grandTotal}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
