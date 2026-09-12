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

const NAV_ITEMS = [
  { href: "/eggs/cages", label: "Cages" },
  { href: "/eggs/log", label: "Log Eggs" },
];

export default async function CagesPage() {
  const cages = await prisma.cage.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <SectionNav items={NAV_ITEMS} backHref="/eggs" backLabel="Eggs" />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Cages</h1>
        <Link
          href="/eggs/cages/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          + Add Cage
        </Link>
      </div>

      {cages.length === 0 ? (
        <p className="text-muted-foreground">
          No cages yet. Add your first cage to start logging eggs.
        </p>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="flex-1 space-y-3 overflow-y-auto md:hidden">
            {cages.map((cage) => (
              <div
                key={cage.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{cage.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {cage.currentChickenCount} chickens
                  </p>
                </div>
                <Link
                  href={`/eggs/cages/${cage.id}/edit`}
                  aria-label="Edit cage"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon-lg" }),
                    "text-muted-foreground",
                  )}
                >
                  <Pencil />
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden flex-1 overflow-y-auto overflow-x-auto rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Chicken Count</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {cages.map((cage) => (
                  <TableRow key={cage.id}>
                    <TableCell className="font-medium">{cage.name}</TableCell>
                    <TableCell>{cage.currentChickenCount}</TableCell>
                    <TableCell>
                      <Link
                        href={`/eggs/cages/${cage.id}/edit`}
                        aria-label="Edit cage"
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
