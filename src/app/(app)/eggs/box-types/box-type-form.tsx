"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useActionToast } from "@/hooks/use-action-toast";
import { useTranslations } from "@/lib/i18n/client";
import { saveBoxTypeAction, type BoxTypeFormState } from "./actions";

const initialState: BoxTypeFormState = {};

export function BoxTypeForm({
  boxType,
}: {
  boxType?: { id: string; name: string; eggsPerBox: number };
}) {
  const [state, formAction, pending] = useActionState(
    saveBoxTypeAction,
    initialState,
  );
  useActionToast(state?.error);
  const t = useTranslations();

  return (
    <form action={formAction} className="max-w-md space-y-5">
      {boxType && <input type="hidden" name="id" value={boxType.id} />}

      <div className="space-y-2">
        <Label htmlFor="name">{t("eggs.boxTypes.form.nameLabel")}</Label>
        <Input
          id="name"
          name="name"
          required
          autoFocus
          placeholder={t("eggs.boxTypes.form.namePlaceholder")}
          defaultValue={boxType?.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eggsPerBox">{t("eggs.boxTypes.eggsPerBoxLabel")}</Label>
        <Input
          id="eggsPerBox"
          name="eggsPerBox"
          type="number"
          step="1"
          min="1"
          inputMode="numeric"
          defaultValue={boxType?.eggsPerBox}
        />
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? t("common.saving") : t("eggs.boxTypes.form.save")}
      </Button>
    </form>
  );
}
