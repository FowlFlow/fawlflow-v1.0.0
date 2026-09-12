import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { BoxTypeForm } from "../../box-type-form";

export default async function EditBoxTypePage(
  props: PageProps<"/eggs/box-types/[id]/edit">,
) {
  const { id } = await props.params;
  const boxType = await prisma.eggBoxType.findUnique({ where: { id } });

  if (!boxType) notFound();

  return (
    <div className="space-y-4">
      <BackLink href="/eggs/box-types" label="Box Types" />
      <h1 className="text-xl font-bold">Edit Box Type</h1>
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
