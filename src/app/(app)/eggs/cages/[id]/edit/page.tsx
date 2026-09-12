import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { getT } from "@/lib/i18n/server";
import { CageForm } from "../../cage-form";

export default async function EditCagePage(
  props: PageProps<"/eggs/cages/[id]/edit">,
) {
  const { t } = await getT();
  const { id } = await props.params;
  const cage = await prisma.cage.findUnique({ where: { id } });

  if (!cage) notFound();

  return (
    <div className="space-y-4">
      <BackLink href="/eggs/cages" label={t("eggs.cages.title")} />
      <h1 className="text-xl font-bold">{t("eggs.cages.editTitle")}</h1>
      <CageForm
        cage={{
          id: cage.id,
          name: cage.name,
          currentChickenCount: cage.currentChickenCount,
        }}
      />
    </div>
  );
}
