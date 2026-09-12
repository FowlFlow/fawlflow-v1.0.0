import { BackLink } from "@/components/back-link";
import { getT } from "@/lib/i18n/server";
import { MaterialForm } from "../material-form";

export default async function NewMaterialPage() {
  const { t } = await getT();
  return (
    <div className="space-y-4">
      <BackLink href="/feed/materials" label={t("feed.materials.navLabel")} />
      <h1 className="text-xl font-bold">{t("feed.materials.addNew")}</h1>
      <MaterialForm />
    </div>
  );
}
