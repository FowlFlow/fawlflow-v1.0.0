"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";
import type { Translate } from "@/lib/i18n/translate";

function eggPriceSchema(t: Translate) {
  return z.object({
    pricePerEgg: z.coerce.number().min(0, t("eggs.price.invalidPrice")),
  });
}

export type EggPriceFormState = {
  error?: string;
  success?: boolean;
};

export async function setEggPriceAction(
  _prevState: EggPriceFormState,
  formData: FormData,
): Promise<EggPriceFormState> {
  const { t } = await getT();
  const parsed = eggPriceSchema(t).safeParse({
    pricePerEgg: formData.get("pricePerEgg"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? t("eggs.validation.checkForm"),
    };
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
