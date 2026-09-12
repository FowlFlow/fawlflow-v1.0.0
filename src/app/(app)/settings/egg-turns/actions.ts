"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const turnSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Name is required").max(50),
  sortOrder: z.coerce.number().int(),
});

export type TurnFormState = { error?: string };

export async function saveTurnAction(
  _prevState: TurnFormState,
  formData: FormData,
): Promise<TurnFormState> {
  const parsed = turnSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const { id, name, sortOrder } = parsed.data;

  if (id) {
    await prisma.eggTurn.update({ where: { id }, data: { name, sortOrder } });
  } else {
    const existing = await prisma.eggTurn.findUnique({ where: { name } });
    if (existing) {
      return { error: "A turn with this name already exists." };
    }
    await prisma.eggTurn.create({ data: { name, sortOrder } });
  }

  revalidatePath("/settings/egg-turns");
  revalidatePath("/eggs/log");
  redirect(`/settings/egg-turns?flash=${encodeURIComponent(id ? "Turn updated." : "Turn added.")}`);
}
