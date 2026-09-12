"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";

export type PurchaseFormState = { error?: string };

export async function recordPurchaseAction(
  _prevState: PurchaseFormState,
  formData: FormData,
): Promise<PurchaseFormState> {
  const { t } = await getT();

  const purchaseSchema = z.object({
    materialId: z.string().min(1, t("common.select", { item: t("common.material") })),
    supplierId: z.string().min(1, t("common.select", { item: t("common.supplier") })),
    date: z.string().min(1, t("feed.common.dateRequired")),
    enteredUnit: z.enum(["KG", "TON"]),
    enteredQuantity: z.coerce.number().positive(t("feed.common.quantityPositive")),
    totalCost: z.coerce.number().min(0, t("feed.purchases.totalCostNegative")),
    notes: z.string().trim().max(300).optional(),
  });

  const parsed = purchaseSchema.safeParse({
    materialId: formData.get("materialId"),
    supplierId: formData.get("supplierId"),
    date: formData.get("date"),
    enteredUnit: formData.get("enteredUnit"),
    enteredQuantity: formData.get("enteredQuantity"),
    totalCost: formData.get("totalCost"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("feed.common.checkForm") };
  }

  const {
    materialId,
    supplierId,
    date,
    enteredUnit,
    enteredQuantity,
    totalCost,
    notes,
  } = parsed.data;

  const material = await prisma.rawMaterial.findUnique({ where: { id: materialId } });
  if (!material) return { error: t("feed.common.materialNotFound") };

  const supplier = await prisma.contact.findUnique({ where: { id: supplierId } });
  if (!supplier) return { error: t("feed.purchases.supplierNotFound") };

  const quantityKg = enteredUnit === "TON" ? enteredQuantity * 1000 : enteredQuantity;
  const unitCostPerKg = totalCost / quantityKg;

  await prisma.$transaction(async (tx) => {
    await tx.rawMaterialPurchase.create({
      data: {
        materialId,
        supplierId,
        date: new Date(date),
        enteredUnit,
        enteredQuantity,
        quantityKg,
        totalCost,
        unitCostPerKg,
        notes,
      },
    });

    if (!supplier.isSupplier) {
      await tx.contact.update({
        where: { id: supplierId },
        data: { isSupplier: true },
      });
    }
  });

  revalidatePath("/feed/materials");
  revalidatePath("/feed/purchases");
  redirect(`/feed/purchases?flash=${encodeURIComponent(t("feed.purchases.recorded"))}`);
}
