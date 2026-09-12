import { prisma } from "@/lib/prisma";

export async function getRawMaterialStockKg(materialId: string): Promise<number> {
  const [purchased, consumed, sold] = await Promise.all([
    prisma.rawMaterialPurchase.aggregate({
      _sum: { quantityKg: true },
      where: { materialId, deletedAt: null },
    }),
    prisma.feedProductionConsumption.aggregate({
      _sum: { quantityKg: true },
      where: { materialId, production: { deletedAt: null } },
    }),
    prisma.rawMaterialSale.aggregate({
      _sum: { quantityKg: true },
      where: { materialId, deletedAt: null },
    }),
  ]);

  const purchasedKg = purchased._sum.quantityKg?.toNumber() ?? 0;
  const consumedKg = consumed._sum.quantityKg?.toNumber() ?? 0;
  const soldKg = sold._sum.quantityKg?.toNumber() ?? 0;

  return purchasedKg - consumedKg - soldKg;
}

export async function getFeedStockKg(feedTypeId: string): Promise<number> {
  const [produced, sold, used] = await Promise.all([
    prisma.feedProductionBatch.aggregate({
      _sum: { quantityProducedKg: true },
      where: { feedTypeId, deletedAt: null },
    }),
    prisma.feedSale.aggregate({
      _sum: { quantityKg: true },
      where: { feedTypeId, deletedAt: null },
    }),
    prisma.feedUsage.aggregate({
      _sum: { quantityKg: true },
      where: { feedTypeId, deletedAt: null },
    }),
  ]);

  const producedKg = produced._sum.quantityProducedKg?.toNumber() ?? 0;
  const soldKg = sold._sum.quantityKg?.toNumber() ?? 0;
  const usedKg = used._sum.quantityKg?.toNumber() ?? 0;

  return producedKg - soldKg - usedKg;
}

export async function getEggStockCount(): Promise<number> {
  const [collected, sold] = await Promise.all([
    prisma.eggCollection.aggregate({
      _sum: { eggCount: true, crackedCount: true },
      where: { deletedAt: null },
    }),
    prisma.eggSale.aggregate({
      _sum: { totalEggCount: true },
      where: { deletedAt: null },
    }),
  ]);

  const collectedCount = collected._sum.eggCount ?? 0;
  const crackedCount = collected._sum.crackedCount ?? 0;
  const soldCount = sold._sum.totalEggCount ?? 0;

  return collectedCount - crackedCount - soldCount;
}

export async function getLatestUnitCost(
  materialId: string,
  asOfDate: Date,
): Promise<number | null> {
  const purchase = await prisma.rawMaterialPurchase.findFirst({
    where: { materialId, deletedAt: null, date: { lte: asOfDate } },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return purchase ? purchase.unitCostPerKg.toNumber() : null;
}

export async function getEggPriceAsOf(asOfDate: Date): Promise<number | null> {
  const setting = await prisma.eggPrice.findFirst({
    where: { date: { lte: asOfDate } },
    orderBy: { date: "desc" },
  });

  return setting ? setting.pricePerEgg.toNumber() : null;
}
