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
  { href: "/feed/sales", label: "Sales" },
  { href: "/feed/usage", label: "Farm Use" },
];

export default async function UsagePage() {
  const usages = await prisma.feedUsage.findMany({
    where: { deletedAt: null },
    orderBy: { date: "desc" },
    include: { feedType: true },
    take: 50,
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <SectionNav items={NAV_ITEMS} backHref="/feed" backLabel="Feed" />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Farm Use</h1>
        <Link
          href="/feed/usage/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          + Log Farm Use
        </Link>
      </div>

      {usages.length === 0 ? (
        <p className="text-muted-foreground">
          No farm-use entries recorded yet.
        </p>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="flex-1 space-y-3 overflow-y-auto md:hidden">
            {usages.map((usage) => (
              <div key={usage.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{usage.feedType.nameEn}</p>
                  <p className="shrink-0 text-sm text-muted-foreground">
                    {usage.date.toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span>{usage.quantityKg.toString()} kg</span>
                  {usage.notes && (
                    <span className="text-muted-foreground">{usage.notes}</span>
                  )}
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
                  <TableHead>Feed Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usages.map((usage) => (
                  <TableRow key={usage.id}>
                    <TableCell>{usage.date.toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">
                      {usage.feedType.nameEn}
                    </TableCell>
                    <TableCell>{usage.quantityKg.toString()} kg</TableCell>
                    <TableCell className="text-muted-foreground">
                      {usage.notes ?? "—"}
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
