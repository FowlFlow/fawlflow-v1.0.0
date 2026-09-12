"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const purchaseSchema = z.object({
  materialId: z.string().min(1, "Select a material"),
  supplierId: z.string().min(1, "Select a supplier"),
  date: z.string().min(1, "Date is required"),
  enteredUnit: z.enum(["KG", "TON"]),
  enteredQuantity: z.coerce.number().positive("Quantity must be greater than 0"),
  totalCost: z.coerce.number().min(0, "Total cost can't be negative"),
  notes: z.string().trim().max(300).optional(),
});

export type PurchaseFormState = { error?: string };

export async function recordPurchaseAction(
  _prevState: PurchaseFormState,
  formData: FormData,
): Promise<PurchaseFormState> {
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
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
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
  if (!material) return { error: "Material not found." };

  const supplier = await prisma.contact.findUnique({ where: { id: supplierId } });
  if (!supplier) return { error: "Supplier not found." };

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
  redirect(`/feed/purchases?flash=${encodeURIComponent("Purchase recorded.")}`);
}
