import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { getT } from "@/lib/i18n/server";
import { PurchaseForm } from "../../purchase-form";

export default async function EditPurchasePage(
  props: PageProps<"/feed/purchases/[id]/edit">,
) {
  const { t } = await getT();
  const { id } = await props.params;

  const [purchase, materials, suppliers] = await Promise.all([
    prisma.rawMaterialPurchase.findUnique({ where: { id } }),
    prisma.rawMaterial.findMany({
      where: { isActive: true },
      orderBy: { nameEn: "asc" },
      select: { id: true, nameEn: true },
    }),
    prisma.contact.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!purchase || purchase.deletedAt) notFound();

  return (
    <div className="space-y-4">
      <BackLink href="/feed/purchases" label={t("feed.purchases.navLabel")} />
      <h1 className="text-xl font-bold">{t("feed.purchases.editTitle")}</h1>
      <PurchaseForm
        materials={materials}
        suppliers={suppliers}
        purchase={{
          id: purchase.id,
          materialId: purchase.materialId,
          supplierId: purchase.supplierId,
          date: purchase.date.toISOString().slice(0, 10),
          enteredUnit: purchase.enteredUnit,
          enteredQuantity: purchase.enteredQuantity.toString(),
          totalCost: purchase.totalCost.toString(),
          notes: purchase.notes ?? undefined,
        }}
      />
    </div>
  );
}
