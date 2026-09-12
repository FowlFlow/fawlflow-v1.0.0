"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useActionToast } from "@/hooks/use-action-toast";
import { useTranslations } from "@/lib/i18n/client";
import { saveTurnAction, type TurnFormState } from "./actions";

const initialState: TurnFormState = {};

export function TurnForm({
  turn,
}: {
  turn?: { id: string; name: string; sortOrder: number };
}) {
  const [state, formAction, pending] = useActionState(
    saveTurnAction,
    initialState,
  );
  useActionToast(state?.error);
  const t = useTranslations();

  return (
    <form action={formAction} className="max-w-md space-y-5">
      {turn && <input type="hidden" name="id" value={turn.id} />}

      <div className="space-y-2">
        <Label htmlFor="name">{t("settings.eggTurns.form.name")}</Label>
        <Input
          id="name"
          name="name"
          required
          autoFocus
          placeholder={t("settings.eggTurns.form.namePlaceholder")}
          defaultValue={turn?.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">{t("settings.eggTurns.order")}</Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          step="1"
          inputMode="numeric"
          defaultValue={turn?.sortOrder ?? 0}
        />
        <p className="text-xs text-muted-foreground">
          {t("settings.eggTurns.form.orderHint")}
        </p>
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? t("common.saving") : t("settings.eggTurns.form.submit")}
      </Button>
    </form>
  );
}
