import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { getT } from "@/lib/i18n/server";
import { SaleForm } from "../../sale-form";

export default async function EditSalePage(
  props: PageProps<"/feed/sales/[id]/edit">,
) {
  const { t } = await getT();
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const typeParam = typeof searchParams.type === "string" ? searchParams.type : undefined;
  const saleType: "FEED" | "MATERIAL" = typeParam === "Material" ? "MATERIAL" : "FEED";

  const [feedTypes, materials, buyers] = await Promise.all([
    prisma.feedType.findMany({
      where: { isActive: true },
      orderBy: { nameEn: "asc" },
      select: { id: true, nameEn: true, defaultSellPricePerKg: true },
    }),
    prisma.rawMaterial.findMany({
      where: { isActive: true },
      orderBy: { nameEn: "asc" },
      select: { id: true, nameEn: true, defaultSellPricePerKg: true },
    }),
    prisma.contact.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  let sale: {
    id: string;
    saleType: "FEED" | "MATERIAL";
    itemId: string;
    buyerId: string;
    date: string;
    quantityKg: string;
    pricePerKg: string;
    notes?: string;
  };

  if (saleType === "FEED") {
    const feedSale = await prisma.feedSale.findUnique({ where: { id } });
    if (!feedSale || feedSale.deletedAt) notFound();
    sale = {
      id: feedSale.id,
      saleType: "FEED",
      itemId: feedSale.feedTypeId,
      buyerId: feedSale.buyerId,
      date: feedSale.date.toISOString().slice(0, 10),
      quantityKg: feedSale.quantityKg.toString(),
      pricePerKg: feedSale.pricePerKg.toString(),
      notes: feedSale.notes ?? undefined,
    };
  } else {
    const materialSale = await prisma.rawMaterialSale.findUnique({ where: { id } });
    if (!materialSale || materialSale.deletedAt) notFound();
    sale = {
      id: materialSale.id,
      saleType: "MATERIAL",
      itemId: materialSale.materialId,
      buyerId: materialSale.buyerId,
      date: materialSale.date.toISOString().slice(0, 10),
      quantityKg: materialSale.quantityKg.toString(),
      pricePerKg: materialSale.pricePerKg.toString(),
      notes: materialSale.notes ?? undefined,
    };
  }

  return (
    <div className="space-y-4">
      <BackLink href="/feed/sales" label={t("feed.sales.navLabel")} />
      <h1 className="text-xl font-bold">{t("feed.sales.editTitle")}</h1>
      <SaleForm
        feedTypes={feedTypes.map((f) => ({
          id: f.id,
          nameEn: f.nameEn,
          defaultSellPricePerKg: f.defaultSellPricePerKg.toString(),
        }))}
        materials={materials.map((m) => ({
          id: m.id,
          nameEn: m.nameEn,
          defaultSellPricePerKg: m.defaultSellPricePerKg.toString(),
        }))}
        buyers={buyers}
        sale={sale}
      />
    </div>
  );
}
