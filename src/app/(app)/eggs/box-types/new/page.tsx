import { BackLink } from "@/components/back-link";
import { getT } from "@/lib/i18n/server";
import { BoxTypeForm } from "../box-type-form";

export default async function NewBoxTypePage() {
  const { t } = await getT();
  return (
    <div className="space-y-4">
      <BackLink href="/eggs/box-types" label={t("eggs.boxTypes.title")} />
      <h1 className="text-xl font-bold">{t("eggs.boxTypes.addNew")}</h1>
      <BoxTypeForm />
    </div>
  );
}
