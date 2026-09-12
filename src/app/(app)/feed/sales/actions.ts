"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  getFeedStockKg,
  getRawMaterialStockKg,
  getLatestUnitCost,
} from "@/lib/stock";
import { getT } from "@/lib/i18n/server";

export type SaleFormState = {
  error?: string;
  needsConfirmation?: boolean;
  formValues?: {
    saleType: string;
    itemId: string;
    buyerId: string;
    date: string;
    quantityKg: string;
    pricePerKg: string;
    notes?: string;
  };
  shortage?: {
    itemName: string;
    availableKg: number;
    requestedKg: number;
    resultingKg: number;
  };
};

export async function recordSaleAction(
  _prevState: SaleFormState,
  formData: FormData,
): Promise<SaleFormState> {
  const { t } = await getT();

  const saleSchema = z.object({
    saleType: z.enum(["FEED", "MATERIAL"]),
    itemId: z.string().min(1, t("feed.sales.selectItemMsg")),
    buyerId: z.string().min(1, t("common.select", { item: t("common.buyer") })),
    date: z.string().min(1, t("feed.common.dateRequired")),
    quantityKg: z.coerce.number().positive(t("feed.common.quantityPositive")),
    pricePerKg: z.coerce.number().min(0),
    notes: z.string().trim().max(300).optional(),
    confirmed: z.coerce.boolean().optional(),
  });

  const parsed = saleSchema.safeParse({
    saleType: formData.get("saleType"),
    itemId: formData.get("itemId"),
    buyerId: formData.get("buyerId"),
    date: formData.get("date"),
    quantityKg: formData.get("quantityKg"),
    pricePerKg: formData.get("pricePerKg"),
    notes: formData.get("notes") || undefined,
    confirmed: formData.get("confirmed") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("feed.common.checkForm") };
  }

  const { saleType, itemId, buyerId, date, quantityKg, pricePerKg, notes, confirmed } =
    parsed.data;

  const buyer = await prisma.contact.findUnique({ where: { id: buyerId } });
  if (!buyer) return { error: t("feed.sales.buyerNotFound") };

  const saleDate = new Date(date);
  const totalAmount = quantityKg * pricePerKg;

  if (saleType === "FEED") {
    const feedType = await prisma.feedType.findUnique({ where: { id: itemId } });
    if (!feedType) return { error: t("feed.common.feedTypeNotFound") };

    const availableKg = await getFeedStockKg(itemId);
    const resultingKg = availableKg - quantityKg;

    if (resultingKg < 0 && !confirmed) {
      return {
        needsConfirmation: true,
        formValues: {
          saleType,
          itemId,
          buyerId,
          date,
          quantityKg: quantityKg.toString(),
          pricePerKg: pricePerKg.toString(),
          notes,
        },
        shortage: {
          itemName: feedType.nameEn,
          availableKg,
          requestedKg: quantityKg,
          resultingKg,
        },
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.feedSale.create({
        data: {
          feedTypeId: itemId,
          buyerId,
          date: saleDate,
          quantityKg,
          pricePerKg,
          totalAmount,
          notes,
        },
      });
      if (!buyer.isBuyer) {
        await tx.contact.update({ where: { id: buyerId }, data: { isBuyer: true } });
      }
    });
  } else {
    const material = await prisma.rawMaterial.findUnique({ where: { id: itemId } });
    if (!material) return { error: t("feed.common.materialNotFound") };

    const unitCostPerKg = await getLatestUnitCost(itemId, saleDate);
    if (unitCostPerKg === null) {
      return {
        error: t("feed.sales.noPurchaseHistory", { name: material.nameEn }),
      };
    }

    const availableKg = await getRawMaterialStockKg(itemId);
    const resultingKg = availableKg - quantityKg;

    if (resultingKg < 0 && !confirmed) {
      return {
        needsConfirmation: true,
        formValues: {
          saleType,
          itemId,
          buyerId,
          date,
          quantityKg: quantityKg.toString(),
          pricePerKg: pricePerKg.toString(),
          notes,
        },
        shortage: {
          itemName: material.nameEn,
          availableKg,
          requestedKg: quantityKg,
          resultingKg,
        },
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.rawMaterialSale.create({
        data: {
          materialId: itemId,
          buyerId,
          date: saleDate,
          quantityKg,
          unitCostPerKg,
          pricePerKg,
          totalAmount,
          notes,
        },
      });
      if (!buyer.isBuyer) {
        await tx.contact.update({ where: { id: buyerId }, data: { isBuyer: true } });
      }
    });
  }

  revalidatePath("/feed/materials");
  revalidatePath("/feed/types");
  revalidatePath("/feed/sales");
  redirect(`/feed/sales?flash=${encodeURIComponent(t("feed.sales.recorded"))}`);
}

export async function updateSaleAction(
  _prevState: SaleFormState,
  formData: FormData,
): Promise<SaleFormState> {
  const { t } = await getT();

  const updateSaleSchema = z.object({
    id: z.string().min(1),
    saleType: z.enum(["FEED", "MATERIAL"]),
    itemId: z.string().min(1, t("feed.sales.selectItemMsg")),
    buyerId: z.string().min(1, t("common.select", { item: t("common.buyer") })),
    date: z.string().min(1, t("feed.common.dateRequired")),
    quantityKg: z.coerce.number().positive(t("feed.common.quantityPositive")),
    pricePerKg: z.coerce.number().min(0),
    notes: z.string().trim().max(300).optional(),
  });

  const parsed = updateSaleSchema.safeParse({
    id: formData.get("id"),
    saleType: formData.get("saleType"),
    itemId: formData.get("itemId"),
    buyerId: formData.get("buyerId"),
    date: formData.get("date"),
    quantityKg: formData.get("quantityKg"),
    pricePerKg: formData.get("pricePerKg"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("feed.common.checkForm") };
  }

  const { id, saleType, itemId, buyerId, date, quantityKg, pricePerKg, notes } = parsed.data;

  const buyer = await prisma.contact.findUnique({ where: { id: buyerId } });
  if (!buyer) return { error: t("feed.sales.buyerNotFound") };

  const saleDate = new Date(date);
  const totalAmount = quantityKg * pricePerKg;

  if (saleType === "FEED") {
    const existing = await prisma.feedSale.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) return { error: t("feed.sales.notFound") };

    const feedType = await prisma.feedType.findUnique({ where: { id: itemId } });
    if (!feedType) return { error: t("feed.common.feedTypeNotFound") };

    await prisma.$transaction(async (tx) => {
      await tx.feedSale.update({
        where: { id },
        data: {
          feedTypeId: itemId,
          buyerId,
          date: saleDate,
          quantityKg,
          pricePerKg,
          totalAmount,
          notes,
        },
      });
      if (!buyer.isBuyer) {
        await tx.contact.update({ where: { id: buyerId }, data: { isBuyer: true } });
      }
    });
  } else {
    const existing = await prisma.rawMaterialSale.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) return { error: t("feed.sales.notFound") };

    const material = await prisma.rawMaterial.findUnique({ where: { id: itemId } });
    if (!material) return { error: t("feed.common.materialNotFound") };

    const unitCostPerKg = await getLatestUnitCost(itemId, saleDate);
    if (unitCostPerKg === null) {
      return {
        error: t("feed.sales.noPurchaseHistory", { name: material.nameEn }),
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.rawMaterialSale.update({
        where: { id },
        data: {
          materialId: itemId,
          buyerId,
          date: saleDate,
          quantityKg,
          unitCostPerKg,
          pricePerKg,
          totalAmount,
          notes,
        },
      });
      if (!buyer.isBuyer) {
        await tx.contact.update({ where: { id: buyerId }, data: { isBuyer: true } });
      }
    });
  }

  revalidatePath("/feed/materials");
  revalidatePath("/feed/types");
  revalidatePath("/feed/sales");
  redirect(`/feed/sales?flash=${encodeURIComponent(t("feed.sales.updated"))}`);
}

export async function deleteSaleAction(
  id: string,
  saleType: "FEED" | "MATERIAL",
): Promise<void> {
  if (saleType === "FEED") {
    const sale = await prisma.feedSale.findUnique({ where: { id } });
    if (!sale || sale.deletedAt) return;

    await prisma.feedSale.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  } else {
    const sale = await prisma.rawMaterialSale.findUnique({ where: { id } });
    if (!sale || sale.deletedAt) return;

    await prisma.rawMaterialSale.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  revalidatePath("/feed/materials");
  revalidatePath("/feed/types");
  revalidatePath("/feed/sales");
}
