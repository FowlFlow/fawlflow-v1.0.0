import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getRawMaterialStockKg, getFeedStockKg } from "@/lib/stock";
import { buttonVariants } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { SectionNav } from "@/components/section-nav";

const NAV_ITEMS = [
  { href: "/feed/reports", label: "Cost" },
  { href: "/feed/reports/profit", label: "Profit" },
];

export default async function ReportsPage(props: PageProps<"/feed/reports">) {
  const searchParams = await props.searchParams;
  const dateParam =
    typeof searchParams.date === "string" ? searchParams.date : undefined;
  const feedTypeIdParam =
    typeof searchParams.feedTypeId === "string" ? searchParams.feedTypeId : "";
  const today = new Date().toISOString().slice(0, 10);
  const selectedDate = dateParam ?? today;

  const [materials, feedTypes] = await Promise.all([
    prisma.rawMaterial.findMany({
      where: { isActive: true },
      orderBy: { nameEn: "asc" },
    }),
    prisma.feedType.findMany({
      where: { isActive: true },
      orderBy: { nameEn: "asc" },
    }),
  ]);

  const selectedFeedType = feedTypes.find((ft) => ft.id === feedTypeIdParam);

  const consumptions = await prisma.feedProductionConsumption.findMany({
    where: {
      date: new Date(selectedDate),
      production: {
        deletedAt: null,
        ...(selectedFeedType ? { feedTypeId: selectedFeedType.id } : {}),
      },
    },
    include: { material: true },
  });

  const dailyCost = consumptions.reduce(
    (sum, c) => sum + c.quantityKg.toNumber() * c.unitCostPerKg.toNumber(),
    0,
  );

  const materialStocks = await Promise.all(
    materials.map((material) => getRawMaterialStockKg(material.id)),
  );
  const feedStocks = await Promise.all(
    feedTypes.map((feedType) => getFeedStockKg(feedType.id)),
  );

  return (
    <div className="space-y-6">
      <SectionNav items={NAV_ITEMS} backHref="/feed" backLabel="Feed" />
      <h1 className="text-xl font-bold">Reports</h1>

      <div className="rounded-lg border p-4">
        <form className="mb-3 flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <label htmlFor="date" className="text-sm font-medium">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              defaultValue={selectedDate}
              className="h-11 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="feedTypeId" className="text-sm font-medium">
              Feed Type
            </label>
            <NativeSelect
              id="feedTypeId"
              name="feedTypeId"
              defaultValue={feedTypeIdParam}
              className="h-11"
            >
              <option value="">All Feed Types</option>
              {feedTypes.map((feedType) => (
                <option key={feedType.id} value={feedType.id}>
                  {feedType.nameEn}
                </option>
              ))}
            </NativeSelect>
          </div>
          <button
            type="submit"
            aria-label="Apply filters"
            className={cn(buttonVariants({ variant: "outline", size: "icon-lg" }))}
          >
            <Search />
          </button>
        </form>
        <p className="text-2xl font-bold">
          Rs.{" "}
          {dailyCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
        <p className="text-sm text-muted-foreground">
          Cost of raw materials used producing{" "}
          {selectedFeedType ? selectedFeedType.nameEn : "feed"} on this date.
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="mb-3 font-semibold">Stock Summary</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Raw Materials
            </p>
            <ul className="space-y-1 text-sm">
              {materials.map((material, i) => (
                <li key={material.id} className="flex justify-between gap-4">
                  <span>{material.nameEn}</span>
                  <span
                    className={cn(
                      materialStocks[i] < 0 && "text-destructive",
                    )}
                  >
                    {materialStocks[i].toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    kg
                  </span>
                </li>
              ))}
              {materials.length === 0 && (
                <li className="text-muted-foreground">None yet.</li>
              )}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Feed
            </p>
            <ul className="space-y-1 text-sm">
              {feedTypes.map((feedType, i) => (
                <li key={feedType.id} className="flex justify-between gap-4">
                  <span>{feedType.nameEn}</span>
                  <span
                    className={cn(feedStocks[i] < 0 && "text-destructive")}
                  >
                    {feedStocks[i].toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    kg
                  </span>
                </li>
              ))}
              {feedTypes.length === 0 && (
                <li className="text-muted-foreground">None yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
