import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { TurnForm } from "../../turn-form";

export default async function EditTurnPage(
  props: PageProps<"/settings/egg-turns/[id]/edit">,
) {
  const { id } = await props.params;
  const turn = await prisma.eggTurn.findUnique({ where: { id } });

  if (!turn) notFound();

  return (
    <div className="space-y-4">
      <BackLink href="/settings/egg-turns" label="Egg Turns" />
      <h1 className="text-xl font-bold">Edit Egg Turn</h1>
      <TurnForm
        turn={{ id: turn.id, name: turn.name, sortOrder: turn.sortOrder }}
      />
    </div>
  );
}
