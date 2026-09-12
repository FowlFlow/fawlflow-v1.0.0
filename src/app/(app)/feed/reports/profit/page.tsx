import { Suspense } from "react";
import { Search } from "lucide-react";
import { getProfitEvents } from "@/lib/profit";
import { cn } from "@/lib/utils";
import { SectionNav } from "@/components/section-nav";
import { SegmentedFilter } from "@/components/segmented-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProfitChart, type ProfitPoint } from "@/components/charts/profit-chart";

const NAV_ITEMS = [
  { href: "/feed/reports", label: "Cost" },
  { href: "/feed/reports/profit", label: "Profit" },
];

type Granularity = "day" | "week" | "month" | "year";

const MAX_BUCKETS = 180;

function parseGranularity(value: string | undefined): Granularity {
  return value === "week" || value === "month" || value === "year"
    ? value
    : "day";
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfWeek(d: Date): Date {
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() + diff);
  return monday;
}

function bucketKeyFor(date: Date, granularity: Granularity): string {
  if (granularity === "year") return date.toISOString().slice(0, 4);
  if (granularity === "month") return date.toISOString().slice(0, 7);
  if (granularity === "week") return dateKey(startOfWeek(date));
  return dateKey(date);
}

function defaultFromFor(granularity: Granularity, to: Date): Date {
  const d = new Date(to);
  if (granularity === "year") {
    d.setUTCFullYear(d.getUTCFullYear() - 4);
  } else if (granularity === "month") {
    d.setUTCMonth(d.getUTCMonth() - 11);
  } else if (granularity === "week") {
    d.setUTCDate(d.getUTCDate() - 7 * 11);
  } else {
    d.setUTCDate(d.getUTCDate() - 13);
  }
  return d;
}

function buildBuckets(
  from: Date,
  to: Date,
  granularity: Granularity,
): { key: string; label: string }[] {
  const buckets: { key: string; label: string }[] = [];

  if (granularity === "year") {
    const cursor = new Date(Date.UTC(from.getUTCFullYear(), 0, 1));
    const end = new Date(Date.UTC(to.getUTCFullYear(), 0, 1));
    while (cursor <= end && buckets.length < MAX_BUCKETS) {
      buckets.push({ key: String(cursor.getUTCFullYear()), label: String(cursor.getUTCFullYear()) });
      cursor.setUTCFullYear(cursor.getUTCFullYear() + 1);
    }
    return buckets;
  }

  if (granularity === "month") {
    const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
    const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1));
    while (cursor <= end && buckets.length < MAX_BUCKETS) {
      buckets.push({
        key: cursor.toISOString().slice(0, 7),
        label: cursor.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      });
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
    return buckets;
  }

  if (granularity === "week") {
    const cursor = startOfWeek(from);
    const end = startOfWeek(to);
    while (cursor <= end && buckets.length < MAX_BUCKETS) {
      buckets.push({
        key: dateKey(cursor),
        label: cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
      cursor.setUTCDate(cursor.getUTCDate() + 7);
    }
    return buckets;
  }

  const cursor = new Date(from);
  while (cursor <= to && buckets.length < MAX_BUCKETS) {
    buckets.push({
      key: dateKey(cursor),
      label: cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return buckets;
}

export default async function ProfitReportPage(
  props: PageProps<"/feed/reports/profit">,
) {
  const searchParams = await props.searchParams;
  const granularity = parseGranularity(
    typeof searchParams.granularity === "string" ? searchParams.granularity : undefined,
  );

  const today = new Date(dateKey(new Date()));
  const toParam = typeof searchParams.to === "string" ? searchParams.to : undefined;
  const fromParam =
    typeof searchParams.from === "string" ? searchParams.from : undefined;

  const to = toParam ? new Date(toParam) : today;
  const from = fromParam ? new Date(fromParam) : defaultFromFor(granularity, to);

  const buckets = buildBuckets(from, to, granularity);
  const events = await getProfitEvents(from, to);

  const profitByBucket: Record<string, number> = {};
  let materialTotal = 0;
  let feedTotal = 0;
  const itemTotals = new Map<
    string,
    { name: string; source: "material" | "feed"; quantityKg: number; revenue: number; profit: number }
  >();

  for (const event of events) {
    const bucketKey = bucketKeyFor(event.date, granularity);
    profitByBucket[bucketKey] = (profitByBucket[bucketKey] ?? 0) + event.profit;
    if (event.source === "material") materialTotal += event.profit;
    else feedTotal += event.profit;

    const itemKey = `${event.source}:${event.itemId}`;
    const existing = itemTotals.get(itemKey) ?? {
      name: event.itemName,
      source: event.source,
      quantityKg: 0,
      revenue: 0,
      profit: 0,
    };
    existing.quantityKg += event.quantityKg;
    existing.revenue += event.revenue;
    existing.profit += event.profit;
    itemTotals.set(itemKey, existing);
  }

  const chartData: ProfitPoint[] = buckets.map((b) => ({
    key: b.key,
    label: b.label,
    profit: Math.round(profitByBucket[b.key] ?? 0),
  }));

  const itemRows = Array.from(itemTotals.values()).sort((a, b) => b.profit - a.profit);
  const totalProfit = materialTotal + feedTotal;

  const rangeLabel = `${from.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${to.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="space-y-6">
      <SectionNav items={NAV_ITEMS} backHref="/feed" backLabel="Feed" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Profit</h1>
        <Suspense fallback={null}>
          <SegmentedFilter
            param="granularity"
            current={granularity}
            options={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "year", label: "Year" },
            ]}
          />
        </Suspense>
      </div>

      <form className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="granularity" value={granularity} />
        <div className="space-y-1">
          <label htmlFor="from" className="text-sm font-medium">
            From
          </label>
          <input
            type="date"
            id="from"
            name="from"
            defaultValue={dateKey(from)}
            className="h-11 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="to" className="text-sm font-medium">
            To
          </label>
          <input
            type="date"
            id="to"
            name="to"
            defaultValue={dateKey(to)}
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

      <Card>
        <CardHeader>
          <CardTitle>{rangeLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={cn(
              "text-3xl font-bold",
              totalProfit < 0 && "text-destructive",
            )}
          >
            Rs.{" "}
            {totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            Material sales: Rs.{" "}
            {materialTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
            · Feed sales: Rs.{" "}
            {feedTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          <ProfitChart data={chartData} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Profit by Item
        </h2>
        {itemRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No sales in this period yet.
          </p>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <div className="space-y-3 md:hidden">
              {itemRows.map((item) => (
                <div key={item.name} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.name}</p>
                      <Badge variant="secondary">
                        {item.source === "feed" ? "Feed" : "Material"}
                      </Badge>
                    </div>
                    <p
                      className={cn(
                        "font-semibold",
                        item.profit < 0 && "text-destructive",
                      )}
                    >
                      Rs.{" "}
                      {item.profit.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {item.quantityKg.toLocaleString(undefined, {
                        maximumFractionDigits: 1,
                      })}{" "}
                      kg sold
                    </span>
                    <span>
                      Revenue: Rs.{" "}
                      {item.revenue.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden overflow-x-auto rounded-lg border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Kg Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemRows.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {item.source === "feed" ? "Feed" : "Material"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.quantityKg.toLocaleString(undefined, {
                          maximumFractionDigits: 1,
                        })}
                      </TableCell>
                      <TableCell>
                        Rs.{" "}
                        {item.revenue.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "font-semibold",
                          item.profit < 0 && "text-destructive",
                        )}
                      >
                        Rs.{" "}
                        {item.profit.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Profit is based on sales only — feed used on the farm isn&apos;t a
        sale, so it isn&apos;t counted here.
      </p>
    </div>
  );
}
