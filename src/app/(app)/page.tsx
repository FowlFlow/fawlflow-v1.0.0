import Link from "next/link";
import { Suspense } from "react";
import {
  Wheat,
  Egg,
  Users,
  Sparkles,
  Tag,
  ClipboardList,
  HandCoins,
  ShoppingCart,
} from "lucide-react";
import { HubLinkGrid } from "@/components/hub-links";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import {
  getEggStockCount,
  getFeedStockKg,
  getRawMaterialStockKg,
  getEggPriceAsOf,
} from "@/lib/stock";
import { EggPriceWidget } from "./eggs/price/egg-price-widget";
import {
  SalesPurchasesChart,
  type SalesPurchasesPoint,
} from "@/components/charts/sales-purchases-chart";
import {
  EggTrendChart,
  type EggTrendPoint,
} from "@/components/charts/egg-trend-chart";
import { SegmentedFilter } from "@/components/segmented-filter";
import { getT } from "@/lib/i18n/server";
import type { Translate } from "@/lib/i18n/translate";

function buildQuickLinks(t: Translate) {
  return [
    {
      href: "/feed",
      icon: Wheat,
      label: t("home.linkFeed"),
      description: t("home.linkFeedDesc"),
    },
    {
      href: "/eggs",
      icon: Egg,
      label: t("home.linkEggs"),
      description: t("home.linkEggsDesc"),
    },
    {
      href: "/contacts",
      icon: Users,
      label: t("home.linkContacts"),
      description: t("home.linkContactsDesc"),
    },
  ];
}

function buildQuickActions(t: Translate) {
  return [
    {
      href: "/eggs/log",
      icon: ClipboardList,
      label: t("home.actionLogEggs"),
      description: t("home.actionLogEggsDesc"),
    },
    {
      href: "/eggs/sales/new",
      icon: HandCoins,
      label: t("home.actionSellEggs"),
      description: t("home.actionSellEggsDesc"),
    },
    {
      href: "/feed/sales/new",
      icon: HandCoins,
      label: t("home.actionSellFeed"),
      description: t("home.actionSellFeedDesc"),
    },
    {
      href: "/feed/purchases/new",
      icon: ShoppingCart,
      label: t("home.actionRecordPurchase"),
      description: t("home.actionRecordPurchaseDesc"),
    },
  ];
}

type Range = "week" | "month" | "year";

// Server runs in UTC; the farm is in Sri Lanka, so greeting/date must use that zone explicitly.
const FARM_TIME_ZONE = "Asia/Colombo";

// Node's bundled ICU data renders Sinhala weekday/month names incorrectly
// (e.g. "September" -> "බිනර"), so the display date is built from these
// known-correct tables instead of trusting Intl's "si-LK" locale data.
const WEEKDAY_SI: Record<string, string> = {
  Sunday: "ඉරිදා",
  Monday: "සඳුදා",
  Tuesday: "අඟහරුවාදා",
  Wednesday: "බදාදා",
  Thursday: "බ්‍රහස්පතින්දා",
  Friday: "සිකුරාදා",
  Saturday: "සෙනසුරාදා",
};
const MONTH_SI: Record<string, string> = {
  January: "ජනවාරි",
  February: "පෙබරවාරි",
  March: "මාර්තු",
  April: "අප්‍රේල්",
  May: "මැයි",
  June: "ජූනි",
  July: "ජූලි",
  August: "අගෝස්තු",
  September: "සැප්තැම්බර්",
  October: "ඔක්තෝබර්",
  November: "නොවැම්බර්",
  December: "දෙසැම්බර්",
};

function formatFarmDate(date: Date, locale: "en" | "si"): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: FARM_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday");
  const month = get("month");
  const day = get("day");

  return locale === "en"
    ? `${weekday}, ${month} ${day}`
    : `${WEEKDAY_SI[weekday] ?? weekday}, ${MONTH_SI[month] ?? month} ${day}`;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getGreeting(hour: number, t: Translate): string {
  if (hour < 12) return t("home.goodMorning");
  if (hour < 17) return t("home.goodAfternoon");
  return t("home.goodEvening");
}

function parseRange(value: string | undefined): Range {
  return value === "week" || value === "year" ? value : "month";
}

// "week"/"month" bucket by exact day; "year" buckets by calendar month so 12
// months of history doesn't render as 365 unreadable bars.
function bucketKey(d: Date, range: Range): string {
  return range === "year" ? d.toISOString().slice(0, 7) : dateKey(d);
}

function rangeStartDate(range: Range): Date {
  const today = new Date().toISOString().slice(0, 10);
  if (range === "year") {
    const d = new Date(today);
    d.setMonth(d.getMonth() - 11);
    d.setDate(1);
    return d;
  }
  const days = range === "week" ? 7 : 30;
  const d = new Date(today);
  d.setDate(d.getDate() - (days - 1));
  return d;
}

function buildBuckets(range: Range): { key: string; label: string }[] {
  const today = new Date().toISOString().slice(0, 10);
  if (range === "year") {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(today);
      d.setMonth(d.getMonth() - (11 - i));
      return {
        key: d.toISOString().slice(0, 7),
        label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      };
    });
  }
  const days = range === "week" ? 7 : 30;
  const start = rangeStartDate(range);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return {
      key: dateKey(d),
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });
}

export default async function HomePage(props: PageProps<"/">) {
  const { t, locale } = await getT();
  const rangeLabels: Record<Range, string> = {
    week: t("home.rangeWeek"),
    month: t("home.rangeMonth"),
    year: t("home.rangeYear"),
  };
  const searchParams = await props.searchParams;
  const range = parseRange(
    typeof searchParams.range === "string" ? searchParams.range : undefined,
  );

  const now = new Date();
  const today = dateKey(now);
  const startDate = rangeStartDate(range);

  const localHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: FARM_TIME_ZONE,
      hour: "numeric",
      hourCycle: "h23",
    }).format(now),
  );
  const displayDate = formatFarmDate(now, locale);

  const [
    todayEggs,
    eggPrice,
    cageCount,
    materials,
    feedTypes,
    purchaseGroups,
    feedSaleGroups,
    materialSaleGroups,
    eggSaleGroups,
    eggCollectionGroups,
  ] = await Promise.all([
    prisma.eggCollection.aggregate({
      _sum: { eggCount: true, crackedCount: true },
      where: { date: new Date(today), deletedAt: null },
    }),
    getEggPriceAsOf(now),
    prisma.cage.count({ where: { isActive: true } }),
    prisma.rawMaterial.findMany({
      where: { isActive: true },
      orderBy: { nameEn: "asc" },
      select: { id: true, nameEn: true, nameSi: true },
    }),
    prisma.feedType.findMany({
      where: { isActive: true },
      orderBy: { nameEn: "asc" },
      select: { id: true, nameEn: true, nameSi: true },
    }),
    prisma.rawMaterialPurchase.groupBy({
      by: ["date"],
      where: { deletedAt: null, date: { gte: startDate } },
      _sum: { totalCost: true },
    }),
    prisma.feedSale.groupBy({
      by: ["date"],
      where: { deletedAt: null, date: { gte: startDate } },
      _sum: { totalAmount: true },
    }),
    prisma.rawMaterialSale.groupBy({
      by: ["date"],
      where: { deletedAt: null, date: { gte: startDate } },
      _sum: { totalAmount: true },
    }),
    prisma.eggSale.groupBy({
      by: ["date"],
      where: { deletedAt: null, date: { gte: startDate } },
      _sum: { totalAmount: true, totalEggCount: true },
    }),
    prisma.eggCollection.groupBy({
      by: ["date"],
      where: { deletedAt: null, date: { gte: startDate } },
      _sum: { eggCount: true, crackedCount: true },
    }),
  ]);

  const eggsToday =
    (todayEggs._sum.eggCount ?? 0) - (todayEggs._sum.crackedCount ?? 0);

  const isFreshInstall =
    cageCount === 0 && materials.length === 0 && feedTypes.length === 0;

  const [materialStocks, feedStocks, eggStock] = await Promise.all([
    Promise.all(
      materials.map(async (m) => ({
        ...m,
        stockKg: await getRawMaterialStockKg(m.id),
      })),
    ),
    Promise.all(
      feedTypes.map(async (f) => ({
        ...f,
        stockKg: await getFeedStockKg(f.id),
      })),
    ),
    getEggStockCount(),
  ]);

  const buckets = buildBuckets(range);

  const salesByBucket: Record<string, number> = {};
  const purchasesByBucket: Record<string, number> = {};
  const collectedByBucket: Record<string, number> = {};
  const soldByBucket: Record<string, number> = {};

  for (const row of feedSaleGroups) {
    const k = bucketKey(row.date, range);
    salesByBucket[k] =
      (salesByBucket[k] ?? 0) + (row._sum.totalAmount?.toNumber() ?? 0);
  }
  for (const row of materialSaleGroups) {
    const k = bucketKey(row.date, range);
    salesByBucket[k] =
      (salesByBucket[k] ?? 0) + (row._sum.totalAmount?.toNumber() ?? 0);
  }
  for (const row of eggSaleGroups) {
    const k = bucketKey(row.date, range);
    salesByBucket[k] =
      (salesByBucket[k] ?? 0) + (row._sum.totalAmount?.toNumber() ?? 0);
    soldByBucket[k] = (soldByBucket[k] ?? 0) + (row._sum.totalEggCount ?? 0);
  }
  for (const row of purchaseGroups) {
    const k = bucketKey(row.date, range);
    purchasesByBucket[k] =
      (purchasesByBucket[k] ?? 0) + (row._sum.totalCost?.toNumber() ?? 0);
  }
  for (const row of eggCollectionGroups) {
    const k = bucketKey(row.date, range);
    const net = (row._sum.eggCount ?? 0) - (row._sum.crackedCount ?? 0);
    collectedByBucket[k] = (collectedByBucket[k] ?? 0) + net;
  }

  const salesPurchasesData: SalesPurchasesPoint[] = buckets.map((b) => ({
    date: b.key,
    label: b.label,
    sales: Math.round(salesByBucket[b.key] ?? 0),
    purchases: Math.round(purchasesByBucket[b.key] ?? 0),
  }));

  const eggTrendData: EggTrendPoint[] = buckets.map((b) => ({
    date: b.key,
    label: b.label,
    collected: collectedByBucket[b.key] ?? 0,
    sold: soldByBucket[b.key] ?? 0,
  }));

  const hasAnyActivity =
    salesPurchasesData.some((p) => p.sales > 0 || p.purchases > 0) ||
    eggTrendData.some((p) => p.collected > 0 || p.sold > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">
          {getGreeting(localHour, t)}
        </h1>
        <p className="text-sm text-muted-foreground">{displayDate}</p>
      </div>

      {isFreshInstall && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <p className="font-semibold">{t("home.welcomeTitle")}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("home.welcomeBody")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/eggs/cages/new"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                {t("home.addCage")}
              </Link>
              <Link
                href="/feed/materials/new"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                {t("home.addMaterial")}
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">{t("home.eggsCollectedToday")}</p>
          <p className="text-3xl font-bold">{eggsToday}</p>
        </div>

        <div className="flex flex-col rounded-2xl border bg-card p-5">
          <EggPriceWidget currentPrice={eggPrice} />
          <Link
            href="/feed/prices"
            className="mt-3 flex items-center gap-1.5 border-t pt-3 text-sm font-medium text-primary hover:text-primary/80"
          >
            <Tag className="h-4 w-4" />
            {t("home.updatePrices")}
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t("home.quickActions")}
        </h2>
        <HubLinkGrid links={buildQuickActions(t)} />
      </div>

      {!isFreshInstall && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t("home.stockSummary")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{t("home.stockEggsTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    eggStock < 0 && "text-destructive",
                  )}
                >
                  {eggStock.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{t("home.inStock")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("home.stockFeedTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {feedStocks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("home.noFeedTypes")}
                  </p>
                ) : (
                  feedStocks.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate pr-2">{f.nameEn}</span>
                      <span
                        className={cn(
                          "shrink-0 font-medium",
                          f.stockKg < 0 && "text-destructive",
                        )}
                      >
                        {f.stockKg.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}{" "}
                        kg
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("home.stockMaterialsTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {materialStocks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("home.noMaterials")}
                  </p>
                ) : (
                  materialStocks.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate pr-2">{m.nameEn}</span>
                      <span
                        className={cn(
                          "shrink-0 font-medium",
                          m.stockKg < 0 && "text-destructive",
                        )}
                      >
                        {m.stockKg.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}{" "}
                        kg
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!isFreshInstall && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {rangeLabels[range]}
            </h2>
            <Suspense fallback={null}>
              <SegmentedFilter
                param="range"
                current={range}
                options={[
                  { value: "week", label: t("home.rangeWeekShort") },
                  { value: "month", label: t("home.rangeMonthShort") },
                  { value: "year", label: t("home.rangeYearShort") },
                ]}
              />
            </Suspense>
          </div>
          {hasAnyActivity ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("home.salesVsPurchases")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <SalesPurchasesChart data={salesPurchasesData} />
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-chart-1)]" />
                      {t("home.sales")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-chart-3)]" />
                      {t("home.purchases")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("home.eggsCollectedVsSold")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <EggTrendChart data={eggTrendData} />
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-chart-1)]" />
                      {t("home.collected")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-chart-2)]" />
                      {t("home.sold")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("home.noActivity")}
            </p>
          )}
        </div>
      )}

      <HubLinkGrid links={buildQuickLinks(t)} />
    </div>
  );
}
