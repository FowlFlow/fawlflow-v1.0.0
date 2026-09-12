import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { getT } from "@/lib/i18n/server";
import { EggSaleForm } from "../../egg-sale-form";

export default async function EditEggSalePage(
  props: PageProps<"/eggs/sales/[id]/edit">,
) {
  const { t } = await getT();
  const { id } = await props.params;

  const [sale, boxTypes, buyers] = await Promise.all([
    prisma.eggSale.findUnique({ where: { id } }),
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
  ]);

  if (!sale || sale.deletedAt) notFound();

  return (
    <div className="space-y-4">
      <BackLink href="/eggs/sales" label={t("eggs.sales.title")} />
      <h1 className="text-xl font-bold">{t("eggs.sales.editTitle")}</h1>
      <EggSaleForm
        boxTypes={boxTypes}
        buyers={buyers}
        sale={{
          id: sale.id,
          buyerId: sale.buyerId,
          date: sale.date.toISOString().slice(0, 10),
          boxTypeId: sale.boxTypeId ?? undefined,
          boxCount: sale.boxCount.toString(),
          looseEggCount: sale.looseEggCount.toString(),
          ratePerEgg: sale.ratePerEgg.toString(),
          notes: sale.notes ?? undefined,
        }}
      />
    </div>
  );
}
