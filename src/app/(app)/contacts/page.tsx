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

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Contacts</h1>
        <Link href="/contacts/new" className={cn(buttonVariants({ size: "sm" }))}>
          + Add Contact
        </Link>
      </div>

      {contacts.length === 0 ? (
        <p className="text-muted-foreground">
          No contacts yet. Add buyers and suppliers here.
        </p>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="flex-1 space-y-3 overflow-y-auto md:hidden">
            {contacts.map((contact) => (
              <div key={contact.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{contact.name}</p>
                  <Link
                    href={`/contacts/${contact.id}/edit`}
                    aria-label="Edit contact"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon-lg" }),
                      "shrink-0 text-muted-foreground",
                    )}
                  >
                    <Pencil />
                  </Link>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {contact.phone ?? "No phone number"}
                </p>
                <div className="mt-2 space-x-1">
                  {contact.isSupplier && (
                    <Badge variant="secondary">Supplier</Badge>
                  )}
                  {contact.isBuyer && <Badge variant="secondary">Buyer</Badge>}
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
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
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
                        <Badge variant="secondary">Supplier</Badge>
                      )}
                      {contact.isBuyer && <Badge variant="secondary">Buyer</Badge>}
                      {!contact.isSupplier && !contact.isBuyer && (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/contacts/${contact.id}/edit`}
                        aria-label="Edit contact"
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
