import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { UsageForm } from "../usage-form";

export default async function NewUsagePage() {
  const feedTypes = await prisma.feedType.findMany({
    where: { isActive: true },
    orderBy: { nameEn: "asc" },
    select: { id: true, nameEn: true },
  });

  return (
    <div className="space-y-4">
      <BackLink href="/feed/usage" label="Farm Use" />
      <h1 className="text-xl font-bold">Log Farm Use</h1>
      <UsageForm feedTypes={feedTypes} />
    </div>
  );
}
