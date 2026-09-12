import { BackLink } from "@/components/back-link";
import { getT } from "@/lib/i18n/server";
import { TurnForm } from "../turn-form";

export default async function NewTurnPage() {
  const { t } = await getT();

  return (
    <div className="space-y-4">
      <BackLink href="/settings/egg-turns" label={t("settings.eggTurns.title")} />
      <h1 className="text-xl font-bold">{t("settings.eggTurns.addTitle")}</h1>
      <TurnForm />
    </div>
  );
}
