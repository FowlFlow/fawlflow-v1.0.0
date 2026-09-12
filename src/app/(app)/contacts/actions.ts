"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(200).optional(),
  isSupplier: z.boolean(),
  isBuyer: z.boolean(),
});

export type ContactFormState = { error?: string };

export async function saveContactAction(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    isSupplier: formData.get("isSupplier") === "on",
    isBuyer: formData.get("isBuyer") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.contact.update({ where: { id }, data });
  } else {
    await prisma.contact.create({ data });
  }

  revalidatePath("/contacts");
  redirect(`/contacts?flash=${encodeURIComponent(id ? "Contact updated." : "Contact added.")}`);
}
