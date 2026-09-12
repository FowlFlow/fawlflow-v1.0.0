import { BackLink } from "@/components/back-link";
import { getT } from "@/lib/i18n/server";
import { CageForm } from "../cage-form";

export default async function NewCagePage() {
  const { t } = await getT();
  return (
    <div className="space-y-4">
      <BackLink href="/eggs/cages" label={t("eggs.cages.title")} />
      <h1 className="text-xl font-bold">{t("eggs.cages.addNew")}</h1>
      <CageForm />
    </div>
  );
}
