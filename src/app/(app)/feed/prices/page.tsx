import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { PricesForm } from "./prices-form";

export default async function PricesPage() {
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
      <BackLink href="/feed" label="Feed" />
      <h1 className="text-xl font-bold">Selling Prices</h1>
      <p className="text-sm text-muted-foreground">
        These prices pre-fill automatically when you record a sale — update
        them whenever market prices change. You can still change the price on
        any individual sale if needed.
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
