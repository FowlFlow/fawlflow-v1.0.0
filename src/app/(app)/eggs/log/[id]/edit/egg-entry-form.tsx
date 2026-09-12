"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NativeSelect } from "@/components/ui/native-select";
import { useActionToast } from "@/hooks/use-action-toast";
import { useTranslations } from "@/lib/i18n/client";
import { updateEggEntryAction, type EggEntryFormState } from "../../actions";

const initialState: EggEntryFormState = {};

export function EggEntryForm({
  entry,
  cages,
  turns,
}: {
  entry: {
    id: string;
    cageId: string;
    turnId: string;
    date: string;
    eggCount: number;
    crackedCount: number;
  };
  cages: { id: string; name: string }[];
  turns: { id: string; name: string }[];
  backHref: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateEggEntryAction,
    initialState,
  );
  useActionToast(state?.error);
  const t = useTranslations();

  return (
    <form action={formAction} className="max-w-md space-y-5">
      <input type="hidden" name="id" value={entry.id} />

      <div className="space-y-2">
        <Label htmlFor="cageId">{t("eggs.log.cageColumn")}</Label>
        <NativeSelect id="cageId" name="cageId" required defaultValue={entry.cageId}>
          {cages.map((cage) => (
            <option key={cage.id} value={cage.id}>
              {cage.name}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="space-y-2">
        <Label htmlFor="turnId">{t("eggs.log.turnColumn")}</Label>
        <NativeSelect id="turnId" name="turnId" required defaultValue={entry.turnId}>
          {turns.map((turn) => (
            <option key={turn.id} value={turn.id}>
              {turn.name}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">{t("common.date")}</Label>
        <Input id="date" name="date" type="date" required defaultValue={entry.date} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="eggCount">{t("eggs.log.eggsColumn")}</Label>
          <Input
            id="eggCount"
            name="eggCount"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            required
            defaultValue={entry.eggCount}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="crackedCount">{t("eggs.log.crackedCountLabel")}</Label>
          <Input
            id="crackedCount"
            name="crackedCount"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            defaultValue={entry.crackedCount}
          />
        </div>
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? t("common.saving") : t("eggs.log.saveEntry")}
      </Button>
    </form>
  );
}
