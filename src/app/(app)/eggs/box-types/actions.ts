"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const boxTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Name is required").max(100),
  eggsPerBox: z.coerce.number().int().positive("Must be greater than 0"),
});

export type BoxTypeFormState = { error?: string };

export async function saveBoxTypeAction(
  _prevState: BoxTypeFormState,
  formData: FormData,
): Promise<BoxTypeFormState> {
  const parsed = boxTypeSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    eggsPerBox: formData.get("eggsPerBox"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const { id, name, eggsPerBox } = parsed.data;

  if (id) {
    await prisma.eggBoxType.update({ where: { id }, data: { name, eggsPerBox } });
  } else {
    const existing = await prisma.eggBoxType.findUnique({ where: { name } });
    if (existing) {
      return { error: "A box type with this name already exists." };
    }
    await prisma.eggBoxType.create({ data: { name, eggsPerBox } });
  }

  revalidatePath("/eggs/box-types");
  redirect(`/eggs/box-types?flash=${encodeURIComponent(id ? "Box type updated." : "Box type added.")}`);
}
