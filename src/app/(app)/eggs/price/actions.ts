"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const eggPriceSchema = z.object({
  pricePerEgg: z.coerce.number().min(0, "Enter a valid price"),
});

export type EggPriceFormState = {
  error?: string;
  success?: boolean;
};

export async function setEggPriceAction(
  _prevState: EggPriceFormState,
  formData: FormData,
): Promise<EggPriceFormState> {
  const parsed = eggPriceSchema.safeParse({
    pricePerEgg: formData.get("pricePerEgg"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const today = new Date(new Date().toISOString().slice(0, 10));

  await prisma.eggPrice.upsert({
    where: { date: today },
    create: { date: today, pricePerEgg: parsed.data.pricePerEgg },
    update: { pricePerEgg: parsed.data.pricePerEgg },
  });

  revalidatePath("/");
  return { success: true };
}
