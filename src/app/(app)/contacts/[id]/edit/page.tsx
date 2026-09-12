import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { ContactForm } from "../../contact-form";

export default async function EditContactPage(props: PageProps<"/contacts/[id]/edit">) {
  const { id } = await props.params;
  const contact = await prisma.contact.findUnique({ where: { id } });

  if (!contact) notFound();

  return (
    <div className="space-y-4">
      <BackLink href="/contacts" label="Contacts" />
      <h1 className="text-xl font-bold">Edit Contact</h1>
      <ContactForm contact={contact} />
    </div>
  );
}
