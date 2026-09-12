"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resetPasswordAction, type ForgotPasswordState } from "./actions";
import { useTranslations } from "@/lib/i18n/client";

const initialState: ForgotPasswordState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );
  const t = useTranslations();

  if (state?.newRecoveryCode) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-bold text-primary">
            {t("auth.passwordUpdated")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("auth.saveRecoveryCode")}
          </p>
          <p className="rounded-lg bg-muted p-4 font-mono text-lg tracking-widest">
            {state.newRecoveryCode}
          </p>
          <Link
            href="/login"
            className="flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("auth.backToSignIn")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold text-primary">
          {t("auth.resetPassword")}
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {t("auth.resetPasswordDesc")}
        </p>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t("auth.userName")}</Label>
            <Input
              id="username"
              name="username"
              required
              className="h-11 rounded-full px-4"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recoveryCode">{t("auth.recoveryCode")}</Label>
            <Input
              id="recoveryCode"
              name="recoveryCode"
              required
              className="h-11 rounded-full px-4"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t("auth.newPassword")}</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              className="h-11 rounded-full px-4"
            />
          </div>

          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="h-12 w-full rounded-full text-base"
          >
            {pending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            {pending ? t("auth.resetting") : t("auth.resetPassword")}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground underline underline-offset-2"
          >
            {t("auth.backToSignIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
