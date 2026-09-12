import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { FeedTypeForm } from "../feed-type-form";

export default async function NewFeedTypePage() {
  const materials = await prisma.rawMaterial.findMany({
    where: { isActive: true },
    orderBy: { nameEn: "asc" },
    select: { id: true, nameEn: true },
  });

  return (
    <div className="space-y-4">
      <BackLink href="/feed/types" label="Recipes" />
      <h1 className="text-xl font-bold">Add Recipe</h1>
      <FeedTypeForm materials={materials} />
    </div>
  );
}
