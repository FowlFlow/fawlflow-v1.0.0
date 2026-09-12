import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChangePasswordForm } from "./change-password-form";
import { RecoveryCodeForm } from "./recovery-code-form";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold">Settings</h1>

      <div className="space-y-3">
        <h2 className="font-semibold">Change Password</h2>
        <ChangePasswordForm />
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Recovery Code</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Used on the &quot;Forgot Password&quot; screen if you ever get
          locked out. Generating a new one immediately invalidates the old
          one.
        </p>
        <RecoveryCodeForm />
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Egg Turns</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          The named times of day you collect eggs (e.g. Morning, Evening) —
          shown as columns on the Log Eggs screen.
        </p>
        <Link
          href="/settings/egg-turns"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Manage Egg Turns
        </Link>
      </div>
    </div>
  );
}
