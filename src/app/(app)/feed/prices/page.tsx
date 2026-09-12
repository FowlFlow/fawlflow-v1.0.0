import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { getT } from "@/lib/i18n/server";
import { PricesForm } from "./prices-form";

export default async function PricesPage() {
  const { t } = await getT();
  const [materials, feedTypes] = await Promise.all([
    prisma.rawMaterial.findMany({
      where: { isActive: true },
      orderBy: { nameEn: "asc" },
      select: { id: true, nameEn: true, nameSi: true, defaultSellPricePerKg: true },
    }),
    prisma.feedType.findMany({
      where: { isActive: true },
      orderBy: { nameEn: "asc" },
      select: { id: true, nameEn: true, nameSi: true, defaultSellPricePerKg: true },
    }),
  ]);

  return (
    <div className="space-y-4">
      <BackLink href="/feed" label={t("feed.hub.title")} />
      <h1 className="text-xl font-bold">{t("feed.prices.title")}</h1>
      <p className="text-sm text-muted-foreground">
        {t("feed.prices.description")}
      </p>
      <PricesForm
        materials={materials.map((m) => ({
          ...m,
          defaultSellPricePerKg: m.defaultSellPricePerKg.toString(),
        }))}
        feedTypes={feedTypes.map((f) => ({
          ...f,
          defaultSellPricePerKg: f.defaultSellPricePerKg.toString(),
        }))}
      />
    </div>
  );
}
