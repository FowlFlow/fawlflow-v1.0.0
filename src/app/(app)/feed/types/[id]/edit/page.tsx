import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { FeedTypeForm } from "../../feed-type-form";

export default async function EditFeedTypePage(
  props: PageProps<"/feed/types/[id]/edit">,
) {
  const { id } = await props.params;

  const [feedType, materials] = await Promise.all([
    prisma.feedType.findUnique({
      where: { id },
      include: {
        recipeItems: { where: { deletedAt: null } },
      },
    }),
    prisma.rawMaterial.findMany({
      where: { isActive: true },
      orderBy: { nameEn: "asc" },
      select: { id: true, nameEn: true },
    }),
  ]);

  if (!feedType) notFound();

  return (
    <div className="space-y-4">
      <BackLink href="/feed/types" label="Recipes" />
      <h1 className="text-xl font-bold">Edit Recipe</h1>
      <FeedTypeForm
        materials={materials}
        feedType={{
          id: feedType.id,
          nameEn: feedType.nameEn,
          nameSi: feedType.nameSi,
          batchSizeKg: feedType.batchSizeKg.toString(),
          defaultSellPricePerKg: feedType.defaultSellPricePerKg.toString(),
          recipeItems: feedType.recipeItems.map((item) => ({
            materialId: item.materialId,
            quantityPerBatchKg: item.quantityPerBatchKg.toString(),
          })),
        }}
      />
    </div>
  );
}
