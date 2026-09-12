"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { getT } from "@/lib/i18n/server";

export type LoginState = { error?: string };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      const { t } = await getT();
      return { error: t("auth.errorInvalidCredentials") };
    }
    throw error;
  }
}
