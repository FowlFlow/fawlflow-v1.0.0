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

const NAV_ITEMS = [
  { href: "/feed/materials", label: "Materials" },
  { href: "/feed/purchases", label: "Purchases" },
];

export default async function PurchasesPage() {
  const purchases = await prisma.rawMaterialPurchase.findMany({
    where: { deletedAt: null },
    orderBy: { date: "desc" },
    include: { material: true, supplier: true },
    take: 50,
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <SectionNav items={NAV_ITEMS} backHref="/feed" backLabel="Feed" />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Purchases</h1>
        <Link
          href="/feed/purchases/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          + Record Purchase
        </Link>
      </div>

      {purchases.length === 0 ? (
        <p className="text-muted-foreground">No purchases recorded yet.</p>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="flex-1 space-y-3 overflow-y-auto md:hidden">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{purchase.material.nameEn}</p>
                  <p className="shrink-0 text-sm text-muted-foreground">
                    {purchase.date.toLocaleDateString()}
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  from {purchase.supplier.name}
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
                  <TableHead>Date</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total Cost</TableHead>
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
