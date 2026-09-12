import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { UsageForm } from "../../usage-form";
import { getT } from "@/lib/i18n/server";

export default async function EditUsagePage(
  props: PageProps<"/feed/usage/[id]/edit">,
) {
  const { t } = await getT();
  const { id } = await props.params;

  const [usage, feedTypes] = await Promise.all([
    prisma.feedUsage.findUnique({ where: { id } }),
    prisma.feedType.findMany({
      where: { isActive: true },
      orderBy: { nameEn: "asc" },
      select: { id: true, nameEn: true },
    }),
  ]);

  if (!usage || usage.deletedAt) notFound();

  return (
    <div className="space-y-4">
      <BackLink href="/feed/usage" label={t("feed.usage.navLabel")} />
      <h1 className="text-xl font-bold">{t("feed.usage.editTitle")}</h1>
      <UsageForm
        feedTypes={feedTypes}
        usage={{
          id: usage.id,
          feedTypeId: usage.feedTypeId,
          date: usage.date.toISOString().slice(0, 10),
          quantityKg: usage.quantityKg.toString(),
          notes: usage.notes ?? undefined,
        }}
      />
    </div>
  );
}
