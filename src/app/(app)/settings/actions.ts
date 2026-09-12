"use server";

import { z } from "zod";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";
import type { Translate } from "@/lib/i18n/translate";

function buildChangePasswordSchema(t: Translate) {
  return z
    .object({
      currentPassword: z
        .string()
        .min(1, t("settings.changePassword.errors.currentRequired")),
      newPassword: z
        .string()
        .min(8, t("settings.changePassword.errors.tooShort")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("settings.changePassword.errors.mismatch"),
      path: ["confirmPassword"],
    });
}

export type ChangePasswordState = { error?: string; success?: boolean };

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const { t } = await getT();
  const session = await auth();
  if (!session?.user?.name) return { error: t("settings.errors.notSignedIn") };

  const changePasswordSchema = buildChangePasswordSchema(t);
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        t("settings.changePassword.errors.checkForm"),
    };
  }

  const user = await prisma.user.findUnique({
    where: { username: session.user.name },
  });
  if (!user) return { error: t("settings.errors.userNotFound") };

  const currentValid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!currentValid) {
    return { error: t("settings.changePassword.errors.currentIncorrect") };
  }

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
  const { t } = await getT();
  const session = await auth();
  if (!session?.user?.name) return { error: t("settings.errors.notSignedIn") };

  const user = await prisma.user.findUnique({
    where: { username: session.user.name },
  });
  if (!user) return { error: t("settings.errors.userNotFound") };

  const newCode = randomBytes(5).toString("hex").toUpperCase();
  await prisma.user.update({
    where: { id: user.id },
    data: { recoveryCodeHash: await bcrypt.hash(newCode, 10) },
  });

  return { newCode };
}
