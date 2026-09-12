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

const NAV_ITEMS = [
  { href: "/feed/materials", label: "Materials" },
  { href: "/feed/purchases", label: "Purchases" },
];

export default async function MaterialsPage() {
  const materials = await prisma.rawMaterial.findMany({
    where: { isActive: true },
    orderBy: { nameEn: "asc" },
  });

  const stocks = await Promise.all(
    materials.map((material) => getRawMaterialStockKg(material.id)),
  );

  return (
    <div className="flex h-full flex-col space-y-4">
      <SectionNav items={NAV_ITEMS} backHref="/feed" backLabel="Feed" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Feed Materials</h1>
        <div className="flex gap-2">
          <Link
            href="/feed/purchases/new"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            + Record Purchase
          </Link>
          <Link
            href="/feed/materials/new"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            + Add Material
          </Link>
        </div>
      </div>

      {materials.length === 0 ? (
        <p className="text-muted-foreground">
          No materials yet. Add your first raw material to get started.
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
                  <Link
                    href={`/feed/materials/${material.id}/edit`}
                    aria-label="Edit material"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon-lg" }),
                      "shrink-0 text-muted-foreground",
                    )}
                  >
                    <Pencil />
                  </Link>
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
                    kg in stock
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
                  <TableHead>Name</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Default Sell Price</TableHead>
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
                      <Link
                        href={`/feed/materials/${material.id}/edit`}
                        aria-label="Edit material"
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon-lg" }),
                          "text-muted-foreground",
                        )}
                      >
                        <Pencil />
                      </Link>
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
