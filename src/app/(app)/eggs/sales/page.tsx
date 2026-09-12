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
  { href: "/eggs/box-types", label: "Box Types" },
  { href: "/eggs/sales", label: "Sales" },
];

export default async function EggSalesPage() {
  const sales = await prisma.eggSale.findMany({
    where: { deletedAt: null },
    orderBy: { date: "desc" },
    include: { buyer: true, boxType: true },
    take: 50,
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <SectionNav items={NAV_ITEMS} backHref="/eggs" backLabel="Eggs" />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Egg Sales</h1>
        <Link
          href="/eggs/sales/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          + Record Sale
        </Link>
      </div>

      {sales.length === 0 ? (
        <p className="text-muted-foreground">No egg sales recorded yet.</p>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="flex-1 space-y-3 overflow-y-auto md:hidden">
            {sales.map((sale) => (
              <div key={sale.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{sale.buyer.name}</p>
                  <p className="shrink-0 text-sm text-muted-foreground">
                    {sale.date.toLocaleDateString()}
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sale.boxCount > 0 &&
                    `${sale.boxCount} × ${sale.boxType?.name ?? "box"}`}
                  {sale.boxCount > 0 && sale.looseEggCount > 0 && " + "}
                  {sale.looseEggCount > 0 && `${sale.looseEggCount} loose`}
                </p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span>{sale.totalEggCount} eggs</span>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Boxes</TableHead>
                  <TableHead>Loose</TableHead>
                  <TableHead>Total Eggs</TableHead>
                  <TableHead>Total</TableHead>
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
                        ? `${sale.boxCount} × ${sale.boxType?.name ?? ""}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {sale.looseEggCount > 0 ? sale.looseEggCount : "—"}
                    </TableCell>
                    <TableCell>{sale.totalEggCount}</TableCell>
                    <TableCell>Rs. {sale.totalAmount.toString()}</TableCell>
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
