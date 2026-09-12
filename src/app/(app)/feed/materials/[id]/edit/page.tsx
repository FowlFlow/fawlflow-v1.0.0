import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { MaterialForm } from "../../material-form";

export default async function EditMaterialPage(
  props: PageProps<"/feed/materials/[id]/edit">,
) {
  const { id } = await props.params;
  const material = await prisma.rawMaterial.findUnique({ where: { id } });

  if (!material) notFound();

  return (
    <div className="space-y-4">
      <BackLink href="/feed/materials" label="Materials" />
      <h1 className="text-xl font-bold">Edit Material</h1>
      <MaterialForm
        material={{
          id: material.id,
          nameEn: material.nameEn,
          nameSi: material.nameSi,
          unit: material.unit,
          defaultSellPricePerKg: material.defaultSellPricePerKg.toString(),
        }}
      />
    </div>
  );
}
