import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { SaleForm } from "../sale-form";

export default async function NewSalePage() {
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

  return (
    <div className="space-y-4">
      <BackLink href="/feed/sales" label="Sales" />
      <h1 className="text-xl font-bold">Record Sale</h1>
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
      />
    </div>
  );
}
