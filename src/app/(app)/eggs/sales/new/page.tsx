import { prisma } from "@/lib/prisma";
import { getEggPriceAsOf } from "@/lib/stock";
import { BackLink } from "@/components/back-link";
import { getT } from "@/lib/i18n/server";
import { EggSaleForm } from "../egg-sale-form";

export default async function NewEggSalePage() {
  const { t } = await getT();
  const [boxTypes, buyers, defaultRatePerEgg] = await Promise.all([
    prisma.eggBoxType.findMany({
      where: { isActive: true },
      orderBy: { eggsPerBox: "asc" },
      select: { id: true, name: true, eggsPerBox: true },
    }),
    prisma.contact.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getEggPriceAsOf(new Date()),
  ]);

  return (
    <div className="space-y-4">
      <BackLink href="/eggs/sales" label={t("eggs.sales.title")} />
      <h1 className="text-xl font-bold">{t("eggs.sales.newTitle")}</h1>
      <EggSaleForm
        boxTypes={boxTypes}
        buyers={buyers}
        defaultRatePerEgg={defaultRatePerEgg}
      />
    </div>
  );
}
