import Link from "next/link";
import { Pencil } from "lucide-react";
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
import { DeleteButton } from "@/components/delete-button";
import { getT } from "@/lib/i18n/server";
import { deactivateContactAction } from "./actions";

export default async function ContactsPage() {
  const { t } = await getT();
  const contacts = await prisma.contact.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("contacts.title")}</h1>
        <Link href="/contacts/new" className={cn(buttonVariants({ size: "sm" }))}>
          + {t("contacts.addNew")}
        </Link>
      </div>

      {contacts.length === 0 ? (
        <p className="text-muted-foreground">{t("contacts.empty")}</p>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="flex-1 space-y-3 overflow-y-auto md:hidden">
            {contacts.map((contact) => (
              <div key={contact.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{contact.name}</p>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/contacts/${contact.id}/edit`}
                      aria-label={t("contacts.editTitle")}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-lg" }),
                        "text-muted-foreground",
                      )}
                    >
                      <Pencil />
                    </Link>
                    <DeleteButton
                      action={deactivateContactAction.bind(null, contact.id)}
                      confirmMessage={t("common.confirmDelete")}
                      label={t("contacts.deactivateAria")}
                    />
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {contact.phone ?? t("contacts.noPhone")}
                </p>
                <div className="mt-2 space-x-1">
                  {contact.isSupplier && (
                    <Badge variant="secondary">{t("common.supplier")}</Badge>
                  )}
                  {contact.isBuyer && (
                    <Badge variant="secondary">{t("common.buyer")}</Badge>
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
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("contacts.phone")}</TableHead>
                  <TableHead>{t("contacts.role")}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.phone ?? "—"}</TableCell>
                    <TableCell className="space-x-1">
                      {contact.isSupplier && (
                        <Badge variant="secondary">{t("common.supplier")}</Badge>
                      )}
                      {contact.isBuyer && (
                        <Badge variant="secondary">{t("common.buyer")}</Badge>
                      )}
                      {!contact.isSupplier && !contact.isBuyer && (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/contacts/${contact.id}/edit`}
                          aria-label={t("contacts.editTitle")}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon-lg" }),
                            "text-muted-foreground",
                          )}
                        >
                          <Pencil />
                        </Link>
                        <DeleteButton
                          action={deactivateContactAction.bind(null, contact.id)}
                          confirmMessage={t("common.confirmDelete")}
                          label={t("contacts.deactivateAria")}
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
