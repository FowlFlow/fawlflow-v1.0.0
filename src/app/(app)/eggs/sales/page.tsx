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
import { deleteEggSaleAction } from "./actions";

export default async function EggSalesPage() {
  const { t } = await getT();
  const navItems = [
    { href: "/eggs/box-types", label: t("eggs.boxTypes.title") },
    { href: "/eggs/sales", label: t("eggs.sales.navLabel") },
  ];
  const sales = await prisma.eggSale.findMany({
    where: { deletedAt: null },
    orderBy: { date: "desc" },
    include: { buyer: true, boxType: true },
    take: 50,
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <SectionNav items={navItems} backHref="/eggs" backLabel={t("eggs.hub.title")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("eggs.sales.title")}</h1>
        <Link
          href="/eggs/sales/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          + {t("eggs.sales.recordSale")}
        </Link>
      </div>

      {sales.length === 0 ? (
        <p className="text-muted-foreground">{t("eggs.sales.empty")}</p>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="flex-1 space-y-3 overflow-y-auto md:hidden">
            {sales.map((sale) => (
              <div key={sale.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{sale.buyer.name}</p>
                  <div className="flex shrink-0 items-center gap-1">
                    <p className="text-sm text-muted-foreground">
                      {sale.date.toLocaleDateString()}
                    </p>
                    <Link
                      href={`/eggs/sales/${sale.id}/edit`}
                      aria-label={t("eggs.sales.editAria")}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-lg" }),
                        "text-muted-foreground",
                      )}
                    >
                      <Pencil />
                    </Link>
                    <DeleteButton
                      action={deleteEggSaleAction.bind(null, sale.id)}
                      confirmMessage={t("common.confirmDelete")}
                      label={t("eggs.sales.deleteAria")}
                    />
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sale.boxCount > 0 &&
                    t("eggs.sales.boxesSummary", {
                      count: sale.boxCount,
                      boxName: sale.boxType?.name ?? t("eggs.sales.boxFallback"),
                    })}
                  {sale.boxCount > 0 && sale.looseEggCount > 0 && " + "}
                  {sale.looseEggCount > 0 &&
                    t("eggs.sales.looseSummary", { count: sale.looseEggCount })}
                </p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span>
                    {t("eggs.sales.totalEggsCount", { count: sale.totalEggCount })}
                  </span>
                  <span className="font-medium">
                    Rs. {sale.totalAmount.toString()}
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
                  <TableHead>{t("common.buyer")}</TableHead>
                  <TableHead>{t("eggs.sales.boxes")}</TableHead>
                  <TableHead>{t("eggs.sales.colLoose")}</TableHead>
                  <TableHead>{t("eggs.sales.colTotalEggs")}</TableHead>
                  <TableHead>{t("common.total")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.date.toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">
                      {sale.buyer.name}
                    </TableCell>
                    <TableCell>
                      {sale.boxCount > 0
                        ? t("eggs.sales.boxesSummary", {
                            count: sale.boxCount,
                            boxName: sale.boxType?.name ?? "",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {sale.looseEggCount > 0 ? sale.looseEggCount : "—"}
                    </TableCell>
                    <TableCell>{sale.totalEggCount}</TableCell>
                    <TableCell>Rs. {sale.totalAmount.toString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/eggs/sales/${sale.id}/edit`}
                          aria-label={t("eggs.sales.editAria")}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon-lg" }),
                            "text-muted-foreground",
                          )}
                        >
                          <Pencil />
                        </Link>
                        <DeleteButton
                          action={deleteEggSaleAction.bind(null, sale.id)}
                          confirmMessage={t("common.confirmDelete")}
                          label={t("eggs.sales.deleteAria")}
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
