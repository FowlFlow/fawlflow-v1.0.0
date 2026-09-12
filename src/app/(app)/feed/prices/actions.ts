"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type UpdatePricesState = { error?: string };

export async function updateSellingPricesAction(
  _prevState: UpdatePricesState,
  formData: FormData,
): Promise<UpdatePricesState> {
  const [materials, feedTypes] = await Promise.all([
    prisma.rawMaterial.findMany({ where: { isActive: true }, select: { id: true } }),
    prisma.feedType.findMany({ where: { isActive: true }, select: { id: true } }),
  ]);

  const updates: { table: "material" | "feedType"; id: string; price: number }[] = [];

  for (const m of materials) {
    const price = Number(formData.get(`material:${m.id}`));
    if (!Number.isFinite(price) || price < 0) {
      return { error: "Please enter a valid price for every item." };
    }
    updates.push({ table: "material", id: m.id, price });
  }
  for (const f of feedTypes) {
    const price = Number(formData.get(`feedType:${f.id}`));
    if (!Number.isFinite(price) || price < 0) {
      return { error: "Please enter a valid price for every item." };
    }
    updates.push({ table: "feedType", id: f.id, price });
  }

  await prisma.$transaction(
    updates.map((u) =>
      u.table === "material"
        ? prisma.rawMaterial.update({
            where: { id: u.id },
            data: { defaultSellPricePerKg: u.price },
          })
        : prisma.feedType.update({
            where: { id: u.id },
            data: { defaultSellPricePerKg: u.price },
          }),
    ),
  );

  revalidatePath("/feed/materials");
  revalidatePath("/feed/types");
  revalidatePath("/feed/prices");
  revalidatePath("/");
  redirect(`/feed/prices?flash=${encodeURIComponent("Prices updated.")}`);
}
