import { BackLink } from "@/components/back-link";
import { getT } from "@/lib/i18n/server";
import { ContactForm } from "../contact-form";

export default async function NewContactPage() {
  const { t } = await getT();

  return (
    <div className="space-y-4">
      <BackLink href="/contacts" label={t("contacts.title")} />
      <h1 className="text-xl font-bold">{t("contacts.addNew")}</h1>
      <ContactForm />
    </div>
  );
}
