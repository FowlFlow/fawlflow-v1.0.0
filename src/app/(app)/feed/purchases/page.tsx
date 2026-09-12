import Link from "next/link";
import { Pencil } from "lucide-react";
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
import { DeleteButton } from "@/components/delete-button";
import { getT } from "@/lib/i18n/server";
import { deletePurchaseAction } from "./actions";

export default async function PurchasesPage() {
  const { t } = await getT();
  const NAV_ITEMS = [
    { href: "/feed/materials", label: t("feed.materials.navLabel") },
    { href: "/feed/purchases", label: t("feed.purchases.navLabel") },
  ];
  const purchases = await prisma.rawMaterialPurchase.findMany({
    where: { deletedAt: null },
    orderBy: { date: "desc" },
    include: { material: true, supplier: true },
    take: 50,
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <SectionNav items={NAV_ITEMS} backHref="/feed" backLabel={t("feed.hub.title")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("feed.purchases.navLabel")}</h1>
        <Link
          href="/feed/purchases/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          + {t("feed.purchases.recordPurchase")}
        </Link>
      </div>

      {purchases.length === 0 ? (
        <p className="text-muted-foreground">{t("feed.purchases.emptyState")}</p>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="flex-1 space-y-3 overflow-y-auto md:hidden">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{purchase.material.nameEn}</p>
                  <div className="flex shrink-0 items-center gap-1">
                    <p className="text-sm text-muted-foreground">
                      {purchase.date.toLocaleDateString()}
                    </p>
                    <Link
                      href={`/feed/purchases/${purchase.id}/edit`}
                      aria-label={t("feed.purchases.editAria")}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-lg" }),
                        "text-muted-foreground",
                      )}
                    >
                      <Pencil />
                    </Link>
                    <DeleteButton
                      action={deletePurchaseAction.bind(null, purchase.id)}
                      confirmMessage={t("common.confirmDelete")}
                      label={t("feed.purchases.deleteAria")}
                    />
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("feed.purchases.fromSupplier", { name: purchase.supplier.name })}
                </p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span>
                    {purchase.enteredQuantity.toString()}{" "}
                    {purchase.enteredUnit === "TON" ? "Ton" : "kg"}
                  </span>
                  <span className="font-medium">
                    Rs. {purchase.totalCost.toString()}
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
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("common.material")}</TableHead>
                  <TableHead>{t("common.supplier")}</TableHead>
                  <TableHead>{t("common.quantity")}</TableHead>
                  <TableHead>{t("feed.purchases.totalCostHeader")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>{purchase.date.toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">
                      {purchase.material.nameEn}
                    </TableCell>
                    <TableCell>{purchase.supplier.name}</TableCell>
                    <TableCell>
                      {purchase.enteredQuantity.toString()}{" "}
                      {purchase.enteredUnit === "TON" ? "Ton" : "kg"}
                    </TableCell>
                    <TableCell>Rs. {purchase.totalCost.toString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/feed/purchases/${purchase.id}/edit`}
                          aria-label={t("feed.purchases.editAria")}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon-lg" }),
                            "text-muted-foreground",
                          )}
                        >
                          <Pencil />
                        </Link>
                        <DeleteButton
                          action={deletePurchaseAction.bind(null, purchase.id)}
                          confirmMessage={t("common.confirmDelete")}
                          label={t("feed.purchases.deleteAria")}
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
