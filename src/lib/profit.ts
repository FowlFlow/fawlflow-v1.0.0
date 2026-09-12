import { prisma } from "@/lib/prisma";

export type ProfitEvent = {
  date: Date;
  profit: number;
  revenue: number;
  quantityKg: number;
  source: "material" | "feed";
  itemId: string;
  itemName: string;
};

// Feed sits in one pooled stock (batches aren't lot-tracked), so a sale's cost
// basis is the production-weighted average of every batch produced on or
// before that sale's date — mirrors how raw-material sales use the latest
// purchase price as of their own date, just averaged since feed has no single
// "latest" batch to point to.
export async function getProfitEvents(
  startDate: Date,
  endDate: Date,
): Promise<ProfitEvent[]> {
  const [materialSales, feedSales, batches] = await Promise.all([
    prisma.rawMaterialSale.findMany({
      where: { deletedAt: null, date: { gte: startDate, lte: endDate } },
      select: {
        date: true,
        quantityKg: true,
        unitCostPerKg: true,
        totalAmount: true,
        materialId: true,
        material: { select: { nameEn: true } },
      },
    }),
    prisma.feedSale.findMany({
      where: { deletedAt: null, date: { gte: startDate, lte: endDate } },
      select: {
        date: true,
        quantityKg: true,
        totalAmount: true,
        feedTypeId: true,
        feedType: { select: { nameEn: true } },
      },
    }),
    prisma.feedProductionBatch.findMany({
      where: { deletedAt: null, date: { lte: endDate } },
      select: {
        feedTypeId: true,
        date: true,
        quantityProducedKg: true,
        consumptions: { select: { quantityKg: true, unitCostPerKg: true } },
      },
    }),
  ]);

  const materialEvents: ProfitEvent[] = materialSales.map((s) => ({
    date: s.date,
    profit:
      s.totalAmount.toNumber() - s.unitCostPerKg.toNumber() * s.quantityKg.toNumber(),
    revenue: s.totalAmount.toNumber(),
    quantityKg: s.quantityKg.toNumber(),
    source: "material",
    itemId: s.materialId,
    itemName: s.material.nameEn,
  }));

  const batchesByFeedType = new Map<
    string,
    { date: Date; producedKg: number; cost: number }[]
  >();
  for (const b of batches) {
    const cost = b.consumptions.reduce(
      (sum, c) => sum + c.quantityKg.toNumber() * c.unitCostPerKg.toNumber(),
      0,
    );
    const list = batchesByFeedType.get(b.feedTypeId) ?? [];
    list.push({ date: b.date, producedKg: b.quantityProducedKg.toNumber(), cost });
    batchesByFeedType.set(b.feedTypeId, list);
  }

  const feedEvents: ProfitEvent[] = feedSales.map((s) => {
    const upToSale = (batchesByFeedType.get(s.feedTypeId) ?? []).filter(
      (b) => b.date <= s.date,
    );
    const producedKg = upToSale.reduce((sum, b) => sum + b.producedKg, 0);
    const cost = upToSale.reduce((sum, b) => sum + b.cost, 0);
    const avgCostPerKg = producedKg > 0 ? cost / producedKg : 0;

    return {
      date: s.date,
      profit: s.totalAmount.toNumber() - avgCostPerKg * s.quantityKg.toNumber(),
      revenue: s.totalAmount.toNumber(),
      quantityKg: s.quantityKg.toNumber(),
      source: "feed",
      itemId: s.feedTypeId,
      itemName: s.feedType.nameEn,
    };
  });

  return [...materialEvents, ...feedEvents];
}
