import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getRawMaterialStockKg } from "@/lib/stock";
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
import { DeleteButton } from "@/components/delete-button";
import { getT } from "@/lib/i18n/server";
import { deactivateMaterialAction } from "./actions";

export default async function MaterialsPage() {
  const { t } = await getT();
  const NAV_ITEMS = [
    { href: "/feed/materials", label: t("feed.materials.navLabel") },
    { href: "/feed/purchases", label: t("feed.purchases.navLabel") },
  ];
  const materials = await prisma.rawMaterial.findMany({
    where: { isActive: true },
    orderBy: { nameEn: "asc" },
  });

  const stocks = await Promise.all(
    materials.map((material) => getRawMaterialStockKg(material.id)),
  );

  return (
    <div className="flex h-full flex-col space-y-4">
      <SectionNav items={NAV_ITEMS} backHref="/feed" backLabel={t("feed.hub.title")} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">{t("feed.materials.title")}</h1>
        <div className="flex gap-2">
          <Link
            href="/feed/purchases/new"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            + {t("feed.purchases.recordPurchase")}
          </Link>
          <Link
            href="/feed/materials/new"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            + {t("feed.materials.addNew")}
          </Link>
        </div>
      </div>

      {materials.length === 0 ? (
        <p className="text-muted-foreground">
          {t("feed.materials.emptyState")}
        </p>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="flex-1 space-y-3 overflow-y-auto md:hidden">
            {materials.map((material, i) => (
              <div key={material.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">
                    {material.nameEn}
                    {material.nameSi && material.nameSi !== material.nameEn && (
                      <span className="ml-2 text-muted-foreground" lang="si">
                        ({material.nameSi})
                      </span>
                    )}
                  </p>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/feed/materials/${material.id}/edit`}
                      aria-label={t("feed.materials.editTitle")}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-lg" }),
                        "text-muted-foreground",
                      )}
                    >
                      <Pencil />
                    </Link>
                    <DeleteButton
                      action={deactivateMaterialAction.bind(null, material.id)}
                      confirmMessage={t("common.confirmDelete")}
                      label={t("feed.materials.deactivateAria")}
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span
                    className={
                      stocks[i] < 0 ? "text-destructive" : "text-muted-foreground"
                    }
                  >
                    {stocks[i].toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    kg {t("feed.common.inStockSuffix")}
                  </span>
                  <span className="text-muted-foreground">
                    Rs. {material.defaultSellPricePerKg.toString()}/kg
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden flex-1 overflow-y-auto overflow-x-auto rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("feed.materials.currentStockHeader")}</TableHead>
                  <TableHead>{t("feed.materials.defaultSellPriceHeader")}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material, i) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">
                      {material.nameEn}
                      {material.nameSi && material.nameSi !== material.nameEn && (
                        <span className="ml-2 text-muted-foreground" lang="si">
                          ({material.nameSi})
                        </span>
                      )}
                    </TableCell>
                    <TableCell
                      className={stocks[i] < 0 ? "text-destructive" : undefined}
                    >
                      {stocks[i].toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      kg
                    </TableCell>
                    <TableCell>
                      Rs. {material.defaultSellPricePerKg.toString()}/kg
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/feed/materials/${material.id}/edit`}
                          aria-label={t("feed.materials.editTitle")}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon-lg" }),
                            "text-muted-foreground",
                          )}
                        >
                          <Pencil />
                        </Link>
                        <DeleteButton
                          action={deactivateMaterialAction.bind(null, material.id)}
                          confirmMessage={t("common.confirmDelete")}
                          label={t("feed.materials.deactivateAria")}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
