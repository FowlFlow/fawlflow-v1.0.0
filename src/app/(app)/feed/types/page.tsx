import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getFeedStockKg } from "@/lib/stock";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionNav } from "@/components/section-nav";

const NAV_ITEMS = [
  { href: "/feed/types", label: "Recipes" },
  { href: "/feed/production", label: "Production" },
];

export default async function FeedTypesPage() {
  const feedTypes = await prisma.feedType.findMany({
    where: { isActive: true },
    orderBy: { nameEn: "asc" },
    include: {
      recipeItems: {
        where: { deletedAt: null },
        include: { material: true },
      },
    },
  });

  const stocks = await Promise.all(
    feedTypes.map((feedType) => getFeedStockKg(feedType.id)),
  );

  return (
    <div className="flex h-full flex-col space-y-4">
      <SectionNav items={NAV_ITEMS} backHref="/feed" backLabel="Feed" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Feed Recipes</h1>
        <Link
          href="/feed/types/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          + Add Recipe
        </Link>
      </div>

      {feedTypes.length === 0 ? (
        <p className="text-muted-foreground">
          No feed recipes yet. Create one to start producing feed.
        </p>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto">
          {feedTypes.map((feedType, i) => (
            <div key={feedType.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {feedType.nameEn}
                    {feedType.nameSi && feedType.nameSi !== feedType.nameEn && (
                      <span className="ml-2 text-muted-foreground" lang="si">
                        ({feedType.nameSi})
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Batch size: {feedType.batchSizeKg.toString()} kg · Sell
                    price: Rs. {feedType.defaultSellPricePerKg.toString()}/kg
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      stocks[i] < 0 && "text-destructive",
                    )}
                  >
                    {stocks[i].toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    kg in stock
                  </p>
                  <Link
                    href={`/feed/types/${feedType.id}/edit`}
                    aria-label="Edit recipe"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon-lg" }),
                      "text-muted-foreground",
                    )}
                  >
                    <Pencil />
                  </Link>
                </div>
              </div>
              {feedType.recipeItems.length > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {feedType.recipeItems
                    .map(
                      (item) =>
                        `${item.quantityPerBatchKg.toString()}kg ${item.material.nameEn}`,
                    )
                    .join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
