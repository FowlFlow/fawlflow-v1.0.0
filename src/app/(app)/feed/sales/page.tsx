import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const NAV_ITEMS = [
  { href: "/feed/sales", label: "Sales" },
  { href: "/feed/usage", label: "Farm Use" },
];

export default async function SalesPage() {
  const [feedSales, materialSales] = await Promise.all([
    prisma.feedSale.findMany({
      where: { deletedAt: null },
      include: { feedType: true, buyer: true },
      orderBy: { date: "desc" },
      take: 50,
    }),
    prisma.rawMaterialSale.findMany({
      where: { deletedAt: null },
      include: { material: true, buyer: true },
      orderBy: { date: "desc" },
      take: 50,
    }),
  ]);

  const combined = [
    ...feedSales.map((sale) => ({
      id: sale.id,
      type: "Feed" as const,
      itemName: sale.feedType.nameEn,
      buyer: sale.buyer.name,
      date: sale.date,
      quantityKg: sale.quantityKg.toNumber(),
      totalAmount: sale.totalAmount.toNumber(),
    })),
    ...materialSales.map((sale) => ({
      id: sale.id,
      type: "Material" as const,
      itemName: sale.material.nameEn,
      buyer: sale.buyer.name,
      date: sale.date,
      quantityKg: sale.quantityKg.toNumber(),
      totalAmount: sale.totalAmount.toNumber(),
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="flex h-full flex-col space-y-4">
      <SectionNav items={NAV_ITEMS} backHref="/feed" backLabel="Feed" />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Sales</h1>
        <Link
          href="/feed/sales/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          + Record Sale
        </Link>
      </div>

      {combined.length === 0 ? (
        <p className="text-muted-foreground">No sales recorded yet.</p>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="flex-1 space-y-3 overflow-y-auto md:hidden">
            {combined.map((sale) => (
              <div key={`${sale.type}-${sale.id}`} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{sale.itemName}</p>
                    <Badge variant="secondary">{sale.type}</Badge>
                  </div>
                  <p className="shrink-0 text-sm text-muted-foreground">
                    {sale.date.toLocaleDateString()}
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  to {sale.buyer}
                </p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span>{sale.quantityKg} kg</span>
                  <span className="font-medium">
                    Rs.{" "}
                    {sale.totalAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
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
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combined.map((sale) => (
                  <TableRow key={`${sale.type}-${sale.id}`}>
                    <TableCell>{sale.date.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{sale.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{sale.itemName}</TableCell>
                    <TableCell>{sale.buyer}</TableCell>
                    <TableCell>{sale.quantityKg} kg</TableCell>
                    <TableCell>
                      Rs.{" "}
                      {sale.totalAmount.toLocaleString(undefined, {
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
  );
}
