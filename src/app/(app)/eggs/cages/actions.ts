"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const cageSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Name is required").max(100),
  currentChickenCount: z.coerce.number().int().min(0),
});

export type CageFormState = { error?: string };

export async function saveCageAction(
  _prevState: CageFormState,
  formData: FormData,
): Promise<CageFormState> {
  const parsed = cageSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    currentChickenCount: formData.get("currentChickenCount") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const { id, name, currentChickenCount } = parsed.data;

  if (id) {
    await prisma.cage.update({ where: { id }, data: { name, currentChickenCount } });
  } else {
    const farm = await prisma.farm.findFirst();
    if (!farm) return { error: "No farm set up yet." };

    const existing = await prisma.cage.findFirst({ where: { farmId: farm.id, name } });
    if (existing) {
      return { error: "A cage with this name already exists." };
    }

    await prisma.cage.create({
      data: { farmId: farm.id, name, currentChickenCount },
    });
  }

  revalidatePath("/eggs/cages");
  redirect(`/eggs/cages?flash=${encodeURIComponent(id ? "Cage updated." : "Cage added.")}`);
}
