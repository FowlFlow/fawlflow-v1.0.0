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
import { deactivateCageAction } from "./actions";

export default async function CagesPage() {
  const { t } = await getT();
  const navItems = [
    { href: "/eggs/cages", label: t("eggs.cages.title") },
    { href: "/eggs/log", label: t("eggs.log.title") },
  ];
  const cages = await prisma.cage.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <SectionNav items={navItems} backHref="/eggs" backLabel={t("eggs.hub.title")} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("eggs.cages.title")}</h1>
        <Link
          href="/eggs/cages/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          + {t("eggs.cages.addNew")}
        </Link>
      </div>

      {cages.length === 0 ? (
        <p className="text-muted-foreground">{t("eggs.cages.empty")}</p>
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
                    {t("eggs.cages.chickenCountSuffix", {
                      count: cage.currentChickenCount,
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/eggs/cages/${cage.id}/edit`}
                    aria-label={t("eggs.cages.editAria")}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon-lg" }),
                      "text-muted-foreground",
                    )}
                  >
                    <Pencil />
                  </Link>
                  <DeleteButton
                    action={deactivateCageAction.bind(null, cage.id)}
                    confirmMessage={t("common.confirmDelete")}
                    label={t("eggs.cages.deactivateAria")}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden flex-1 overflow-y-auto overflow-x-auto rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("eggs.cages.chickenCountLabel")}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {cages.map((cage) => (
                  <TableRow key={cage.id}>
                    <TableCell className="font-medium">{cage.name}</TableCell>
                    <TableCell>{cage.currentChickenCount}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/eggs/cages/${cage.id}/edit`}
                          aria-label={t("eggs.cages.editAria")}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon-lg" }),
                            "text-muted-foreground",
                          )}
                        >
                          <Pencil />
                        </Link>
                        <DeleteButton
                          action={deactivateCageAction.bind(null, cage.id)}
                          confirmMessage={t("common.confirmDelete")}
                          label={t("eggs.cages.deactivateAria")}
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
