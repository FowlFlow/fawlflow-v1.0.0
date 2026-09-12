"use server";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";

export type ForgotPasswordState = { error?: string; newRecoveryCode?: string };

export async function resetPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const { t } = await getT();
  const username = formData.get("username");
  const recoveryCode = formData.get("recoveryCode");
  const newPassword = formData.get("newPassword");

  if (
    typeof username !== "string" ||
    typeof recoveryCode !== "string" ||
    typeof newPassword !== "string" ||
    !username ||
    !recoveryCode ||
    !newPassword
  ) {
    return { error: t("auth.errorFillAllFields") };
  }
  if (newPassword.length < 8) {
    return { error: t("auth.errorPasswordTooShort") };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return { error: t("auth.errorInvalidRecovery") };
  }

  const codeValid = await bcrypt.compare(
    recoveryCode.trim().toUpperCase(),
    user.recoveryCodeHash,
  );
  if (!codeValid) {
    return { error: t("auth.errorInvalidRecovery") };
  }

  const newRecoveryCode = randomBytes(5).toString("hex").toUpperCase();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(newPassword, 10),
      recoveryCodeHash: await bcrypt.hash(newRecoveryCode, 10),
    },
  });

  return { newRecoveryCode };
}
