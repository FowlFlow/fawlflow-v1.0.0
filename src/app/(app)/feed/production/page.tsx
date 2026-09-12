import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { SectionNav } from "@/components/section-nav";
import { getT } from "@/lib/i18n/server";

export default async function ProductionPage() {
  const { t } = await getT();
  const NAV_ITEMS = [
    { href: "/feed/types", label: t("feed.types.navLabel") },
    { href: "/feed/production", label: t("feed.production.navLabel") },
  ];
  const batches = await prisma.feedProductionBatch.findMany({
    where: { deletedAt: null },
    orderBy: { date: "desc" },
    include: {
      feedType: true,
      consumptions: { include: { material: true } },
    },
    take: 50,
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <SectionNav items={NAV_ITEMS} backHref="/feed" backLabel={t("feed.hub.title")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("feed.production.navLabel")}</h1>
        <Link
          href="/feed/production/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          + {t("feed.production.produceBatch")}
        </Link>
      </div>

      {batches.length === 0 ? (
        <p className="text-muted-foreground">
          {t("feed.production.emptyState")}
        </p>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="flex-1 space-y-3 overflow-y-auto md:hidden">
            {batches.map((batch) => {
              const totalCost = batch.consumptions.reduce(
                (sum, c) =>
                  sum + c.quantityKg.toNumber() * c.unitCostPerKg.toNumber(),
                0,
              );
              return (
                <div key={batch.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{batch.feedType.nameEn}</p>
                    <p className="shrink-0 text-sm text-muted-foreground">
                      {batch.date.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span>
                      {batch.quantityProducedKg.toString()} kg{" "}
                      {t("feed.production.producedSuffix")}
                    </span>
                    <span className="font-medium">
                      Rs.{" "}
                      {totalCost.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {batch.consumptions
                      .map(
                        (c) =>
                          `${c.quantityKg.toNumber().toFixed(2)}kg ${c.material.nameEn}`,
                      )
                      .join(", ")}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden flex-1 overflow-y-auto overflow-x-auto rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("feed.common.feedType")}</TableHead>
                  <TableHead>{t("feed.production.producedHeader")}</TableHead>
                  <TableHead>{t("feed.reports.navLabel")}</TableHead>
                  <TableHead>{t("feed.production.materialsUsedHeader")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => {
                  const totalCost = batch.consumptions.reduce(
                    (sum, c) =>
                      sum + c.quantityKg.toNumber() * c.unitCostPerKg.toNumber(),
                    0,
                  );
                  return (
                    <TableRow key={batch.id}>
                      <TableCell>{batch.date.toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">
                        {batch.feedType.nameEn}
                      </TableCell>
                      <TableCell>
                        {batch.quantityProducedKg.toString()} kg
                      </TableCell>
                      <TableCell>
                        Rs.{" "}
                        {totalCost.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {batch.consumptions
                          .map(
                            (c) =>
                              `${c.quantityKg.toNumber().toFixed(2)}kg ${c.material.nameEn}`,
                          )
                          .join(", ")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
