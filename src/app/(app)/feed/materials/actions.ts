"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const materialSchema = z.object({
  id: z.string().optional(),
  nameEn: z.string().trim().min(1, "English name is required").max(100),
  nameSi: z.string().trim().max(100).optional(),
  unit: z.enum(["KG", "TON"]),
  defaultSellPricePerKg: z.coerce.number().min(0),
});

export type MaterialFormState = { error?: string };

export async function saveMaterialAction(
  _prevState: MaterialFormState,
  formData: FormData,
): Promise<MaterialFormState> {
  const parsed = materialSchema.safeParse({
    id: formData.get("id") || undefined,
    nameEn: formData.get("nameEn"),
    nameSi: formData.get("nameSi") || undefined,
    unit: formData.get("unit"),
    defaultSellPricePerKg: formData.get("defaultSellPricePerKg") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const { id, nameEn, nameSi, unit, defaultSellPricePerKg } = parsed.data;
  const data = { nameEn, nameSi: nameSi || nameEn, unit, defaultSellPricePerKg };

  if (id) {
    await prisma.rawMaterial.update({ where: { id }, data });
  } else {
    const existing = await prisma.rawMaterial.findUnique({ where: { nameEn } });
    if (existing) {
      return { error: "A material with this name already exists." };
    }
    await prisma.rawMaterial.create({ data });
  }

  revalidatePath("/feed/materials");
  redirect(`/feed/materials?flash=${encodeURIComponent(id ? "Material updated." : "Material added.")}`);
}
