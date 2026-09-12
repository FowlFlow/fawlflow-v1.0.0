import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { getT } from "@/lib/i18n/server";
import { BoxTypeForm } from "../../box-type-form";

export default async function EditBoxTypePage(
  props: PageProps<"/eggs/box-types/[id]/edit">,
) {
  const { t } = await getT();
  const { id } = await props.params;
  const boxType = await prisma.eggBoxType.findUnique({ where: { id } });

  if (!boxType) notFound();

  return (
    <div className="space-y-4">
      <BackLink href="/eggs/box-types" label={t("eggs.boxTypes.title")} />
      <h1 className="text-xl font-bold">{t("eggs.boxTypes.editTitle")}</h1>
      <BoxTypeForm
        boxType={{
          id: boxType.id,
          name: boxType.name,
          eggsPerBox: boxType.eggsPerBox,
        }}
      />
    </div>
  );
}
