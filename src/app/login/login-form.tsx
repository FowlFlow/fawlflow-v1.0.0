"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginAction, type LoginState } from "./actions";
import { useTranslations } from "@/lib/i18n/client";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const t = useTranslations();

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="username">{t("auth.userName")}</Label>
        <Input
          id="username"
          name="username"
          placeholder={t("auth.usernamePlaceholder")}
          required
          autoFocus
          autoComplete="username"
          className="h-11 rounded-full px-4"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("common.password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder={t("auth.passwordPlaceholder")}
          required
          autoComplete="current-password"
          className="h-11 rounded-full px-4"
        />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            {t("auth.forgotPassword")}
          </Link>
        </div>
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
        {pending ? t("auth.signingIn") : t("auth.signIn")}
      </Button>
    </form>
  );
}
