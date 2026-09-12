import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { FeedTypeForm } from "../feed-type-form";
import { getT } from "@/lib/i18n/server";

export default async function NewFeedTypePage() {
  const { t } = await getT();
  const materials = await prisma.rawMaterial.findMany({
    where: { isActive: true },
    orderBy: { nameEn: "asc" },
    select: { id: true, nameEn: true },
  });

  return (
    <div className="space-y-4">
      <BackLink href="/feed/types" label={t("feed.types.navLabel")} />
      <h1 className="text-xl font-bold">{t("feed.types.addNew")}</h1>
      <FeedTypeForm materials={materials} />
    </div>
  );
}
