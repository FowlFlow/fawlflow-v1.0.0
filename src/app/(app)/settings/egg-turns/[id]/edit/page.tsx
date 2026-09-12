import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { getT } from "@/lib/i18n/server";
import { TurnForm } from "../../turn-form";

export default async function EditTurnPage(
  props: PageProps<"/settings/egg-turns/[id]/edit">,
) {
  const { id } = await props.params;
  const turn = await prisma.eggTurn.findUnique({ where: { id } });

  if (!turn) notFound();

  const { t } = await getT();

  return (
    <div className="space-y-4">
      <BackLink href="/settings/egg-turns" label={t("settings.eggTurns.title")} />
      <h1 className="text-xl font-bold">{t("settings.eggTurns.editTitle")}</h1>
      <TurnForm
        turn={{ id: turn.id, name: turn.name, sortOrder: turn.sortOrder }}
      />
    </div>
  );
}
