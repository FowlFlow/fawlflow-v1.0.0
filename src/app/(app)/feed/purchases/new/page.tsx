import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { PurchaseForm } from "../purchase-form";

export default async function NewPurchasePage() {
  const [materials, suppliers] = await Promise.all([
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

  return (
    <div className="space-y-4">
      <BackLink href="/feed/purchases" label="Purchases" />
      <h1 className="text-xl font-bold">Record Purchase</h1>
      <PurchaseForm materials={materials} suppliers={suppliers} />
    </div>
  );
}
