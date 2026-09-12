import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { getT } from "@/lib/i18n/server";
import { ContactForm } from "../../contact-form";

export default async function EditContactPage(props: PageProps<"/contacts/[id]/edit">) {
  const { id } = await props.params;
  const contact = await prisma.contact.findUnique({ where: { id } });

  if (!contact) notFound();

  const { t } = await getT();

  return (
    <div className="space-y-4">
      <BackLink href="/contacts" label={t("contacts.title")} />
      <h1 className="text-xl font-bold">{t("contacts.editTitle")}</h1>
      <ContactForm contact={contact} />
    </div>
  );
}
