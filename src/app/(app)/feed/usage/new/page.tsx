import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { UsageForm } from "../usage-form";
import { getT } from "@/lib/i18n/server";

export default async function NewUsagePage() {
  const { t } = await getT();
  const feedTypes = await prisma.feedType.findMany({
    where: { isActive: true },
    orderBy: { nameEn: "asc" },
    select: { id: true, nameEn: true },
  });

  return (
    <div className="space-y-4">
      <BackLink href="/feed/usage" label={t("feed.usage.navLabel")} />
      <h1 className="text-xl font-bold">{t("feed.usage.logNew")}</h1>
      <UsageForm feedTypes={feedTypes} />
    </div>
  );
}
