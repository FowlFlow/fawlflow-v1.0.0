"use server";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type ForgotPasswordState = { error?: string; newRecoveryCode?: string };

export async function resetPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
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
    return { error: "Please fill in all fields." };
  }
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return { error: "Username or recovery code is incorrect." };
  }

  const codeValid = await bcrypt.compare(
    recoveryCode.trim().toUpperCase(),
    user.recoveryCodeHash,
  );
  if (!codeValid) {
    return { error: "Username or recovery code is incorrect." };
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
