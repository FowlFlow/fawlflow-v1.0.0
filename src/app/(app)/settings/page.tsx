import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";
import { ChangePasswordForm } from "./change-password-form";
import { RecoveryCodeForm } from "./recovery-code-form";

export default async function SettingsPage() {
  const { t } = await getT();

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold">{t("common.settings")}</h1>

      <div className="space-y-3">
        <h2 className="font-semibold">{t("settings.changePassword.title")}</h2>
        <ChangePasswordForm />
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">{t("settings.recoveryCode.title")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("settings.recoveryCode.description")}
        </p>
        <RecoveryCodeForm />
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">{t("settings.eggTurns.title")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("settings.eggTurns.description")}
        </p>
        <Link
          href="/settings/egg-turns"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          {t("settings.eggTurns.manage")}
        </Link>
      </div>
    </div>
  );
}
