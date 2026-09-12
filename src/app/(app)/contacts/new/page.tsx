import { BackLink } from "@/components/back-link";
import { ContactForm } from "../contact-form";

export default function NewContactPage() {
  return (
    <div className="space-y-4">
      <BackLink href="/contacts" label="Contacts" />
      <h1 className="text-xl font-bold">Add Contact</h1>
      <ContactForm />
    </div>
  );
}
