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
import { getT } from "@/lib/i18n/server";

export default async function BoxTypesPage() {
  const { t } = await getT();
  const navItems = [
    { href: "/eggs/box-types", label: t("eggs.boxTypes.title") },
    { href: "/eggs/sales", label: t("eggs.sales.navLabel") },
  ];
  const boxTypes = await prisma.eggBoxType.findMany({
    where: { isActive: true },
    orderBy: { eggsPerBox: "asc" },
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <SectionNav items={navItems} backHref="/eggs" backLabel={t("eggs.hub.title")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("eggs.boxTypes.title")}</h1>
        <Link
          href="/eggs/box-types/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          + {t("eggs.boxTypes.addNew")}
        </Link>
      </div>

      {boxTypes.length === 0 ? (
        <p className="text-muted-foreground">{t("eggs.boxTypes.empty")}</p>
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
                    {t("eggs.boxTypes.eggsPerBoxCount", {
                      count: boxType.eggsPerBox,
                    })}
                  </p>
                </div>
                <Link
                  href={`/eggs/box-types/${boxType.id}/edit`}
                  aria-label={t("eggs.boxTypes.editAria")}
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
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("eggs.boxTypes.eggsPerBoxLabel")}</TableHead>
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
                        aria-label={t("eggs.boxTypes.editAria")}
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
