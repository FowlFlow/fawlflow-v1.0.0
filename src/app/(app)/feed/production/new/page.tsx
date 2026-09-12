import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { ProduceBatchForm } from "../produce-batch-form";

export default async function NewProductionPage() {
  const feedTypes = await prisma.feedType.findMany({
    where: { isActive: true },
    orderBy: { nameEn: "asc" },
    select: { id: true, nameEn: true, batchSizeKg: true },
  });

  return (
    <div className="space-y-4">
      <BackLink href="/feed/production" label="Production" />
      <h1 className="text-xl font-bold">Produce Feed Batch</h1>
      <ProduceBatchForm
        feedTypes={feedTypes.map((ft) => ({
          id: ft.id,
          nameEn: ft.nameEn,
          batchSizeKg: ft.batchSizeKg.toString(),
        }))}
      />
    </div>
  );
}
