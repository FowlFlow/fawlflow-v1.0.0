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
  { href: "/eggs/box-types", label: "Box Types" },
  { href: "/eggs/sales", label: "Sales" },
];

export default async function BoxTypesPage() {
  const boxTypes = await prisma.eggBoxType.findMany({
    where: { isActive: true },
    orderBy: { eggsPerBox: "asc" },
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <SectionNav items={NAV_ITEMS} backHref="/eggs" backLabel="Eggs" />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Box Types</h1>
        <Link
          href="/eggs/box-types/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          + Add Box Type
        </Link>
      </div>

      {boxTypes.length === 0 ? (
        <p className="text-muted-foreground">No box types yet.</p>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="flex-1 space-y-3 overflow-y-auto md:hidden">
            {boxTypes.map((boxType) => (
              <div
                key={boxType.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{boxType.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {boxType.eggsPerBox} eggs
                  </p>
                </div>
                <Link
                  href={`/eggs/box-types/${boxType.id}/edit`}
                  aria-label="Edit box type"
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
                  <TableHead>Eggs per Box</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {boxTypes.map((boxType) => (
                  <TableRow key={boxType.id}>
                    <TableCell className="font-medium">{boxType.name}</TableCell>
                    <TableCell>{boxType.eggsPerBox}</TableCell>
                    <TableCell>
                      <Link
                        href={`/eggs/box-types/${boxType.id}/edit`}
                        aria-label="Edit box type"
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
