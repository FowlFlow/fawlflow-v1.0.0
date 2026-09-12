import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getFeedStockKg } from "@/lib/stock";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionNav } from "@/components/section-nav";
import { DeleteButton } from "@/components/delete-button";
import { getT } from "@/lib/i18n/server";
import { deactivateFeedTypeAction } from "./actions";

export default async function FeedTypesPage() {
  const { t } = await getT();
  const NAV_ITEMS = [
    { href: "/feed/types", label: t("feed.types.navLabel") },
    { href: "/feed/production", label: t("feed.production.navLabel") },
  ];
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
      <SectionNav items={NAV_ITEMS} backHref="/feed" backLabel={t("feed.hub.title")} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">{t("feed.types.title")}</h1>
        <Link
          href="/feed/types/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          + {t("feed.types.addNew")}
        </Link>
      </div>

      {feedTypes.length === 0 ? (
        <p className="text-muted-foreground">{t("feed.types.emptyState")}</p>
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
                    {t("feed.types.batchAndPrice", {
                      size: feedType.batchSizeKg.toString(),
                      price: feedType.defaultSellPricePerKg.toString(),
                    })}
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
                    kg {t("feed.common.inStockSuffix")}
                  </p>
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/feed/types/${feedType.id}/edit`}
                      aria-label={t("feed.types.editTitle")}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-lg" }),
                        "text-muted-foreground",
                      )}
                    >
                      <Pencil />
                    </Link>
                    <DeleteButton
                      action={deactivateFeedTypeAction.bind(null, feedType.id)}
                      confirmMessage={t("common.confirmDelete")}
                      label={t("feed.types.deactivateAria")}
                    />
                  </div>
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
