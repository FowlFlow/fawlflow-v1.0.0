import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { getT } from "@/lib/i18n/server";
import { ProduceBatchForm } from "../../produce-batch-form";

export default async function EditProductionBatchPage(
  props: PageProps<"/feed/production/[id]/edit">,
) {
  const { t } = await getT();
  const { id } = await props.params;

  const [batch, feedTypes] = await Promise.all([
    prisma.feedProductionBatch.findUnique({ where: { id } }),
    prisma.feedType.findMany({
      where: { isActive: true },
      orderBy: { nameEn: "asc" },
      select: { id: true, nameEn: true, batchSizeKg: true },
    }),
  ]);

  if (!batch || batch.deletedAt) notFound();

  return (
    <div className="space-y-4">
      <BackLink href="/feed/production" label={t("feed.production.navLabel")} />
      <h1 className="text-xl font-bold">{t("feed.production.editTitle")}</h1>
      <ProduceBatchForm
        feedTypes={feedTypes.map((f) => ({
          id: f.id,
          nameEn: f.nameEn,
          batchSizeKg: f.batchSizeKg.toString(),
        }))}
        batch={{
          id: batch.id,
          feedTypeId: batch.feedTypeId,
          date: batch.date.toISOString().slice(0, 10),
          quantityProducedKg: batch.quantityProducedKg.toString(),
          notes: batch.notes ?? undefined,
        }}
      />
    </div>
  );
}
