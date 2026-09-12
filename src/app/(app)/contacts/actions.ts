"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";
import type { Translate } from "@/lib/i18n/translate";

function buildContactSchema(t: Translate) {
  return z.object({
    id: z.string().optional(),
    name: z.string().trim().min(1, t("contacts.errors.nameRequired")).max(100),
    phone: z.string().trim().max(30).optional(),
    address: z.string().trim().max(200).optional(),
    isSupplier: z.boolean(),
    isBuyer: z.boolean(),
  });
}

export type ContactFormState = { error?: string };

export async function saveContactAction(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const { t } = await getT();
  const contactSchema = buildContactSchema(t);
  const parsed = contactSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    isSupplier: formData.get("isSupplier") === "on",
    isBuyer: formData.get("isBuyer") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("contacts.errors.checkForm") };
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.contact.update({ where: { id }, data });
  } else {
    await prisma.contact.create({ data });
  }

  revalidatePath("/contacts");
  redirect(
    `/contacts?flash=${encodeURIComponent(id ? t("contacts.flash.updated") : t("contacts.flash.added"))}`,
  );
}

export async function deactivateContactAction(id: string): Promise<void> {
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact || !contact.isActive) return;

  await prisma.contact.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/contacts");
}
