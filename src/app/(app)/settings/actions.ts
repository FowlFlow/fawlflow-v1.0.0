"use server";

import { z } from "zod";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"],
  });

export type ChangePasswordState = { error?: string; success?: boolean };

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await auth();
  if (!session?.user?.name) return { error: "Not signed in." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const user = await prisma.user.findUnique({
    where: { username: session.user.name },
  });
  if (!user) return { error: "User not found." };

  const currentValid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!currentValid) return { error: "Current password is incorrect." };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) },
  });

  return { success: true };
}

export type RegenerateCodeState = { error?: string; newCode?: string };

export async function regenerateRecoveryCodeAction(
  _prevState: RegenerateCodeState,
  _formData: FormData,
): Promise<RegenerateCodeState> {
  const session = await auth();
  if (!session?.user?.name) return { error: "Not signed in." };

  const user = await prisma.user.findUnique({
    where: { username: session.user.name },
  });
  if (!user) return { error: "User not found." };

  const newCode = randomBytes(5).toString("hex").toUpperCase();
  await prisma.user.update({
    where: { id: user.id },
    data: { recoveryCodeHash: await bcrypt.hash(newCode, 10) },
  });

  return { newCode };
}
