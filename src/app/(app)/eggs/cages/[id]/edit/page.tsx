import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { CageForm } from "../../cage-form";

export default async function EditCagePage(
  props: PageProps<"/eggs/cages/[id]/edit">,
) {
  const { id } = await props.params;
  const cage = await prisma.cage.findUnique({ where: { id } });

  if (!cage) notFound();

  return (
    <div className="space-y-4">
      <BackLink href="/eggs/cages" label="Cages" />
      <h1 className="text-xl font-bold">Edit Cage</h1>
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
