"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NativeSelect } from "@/components/ui/native-select";
import { useActionToast } from "@/hooks/use-action-toast";
import {
  logFeedUsageAction,
  updateFeedUsageAction,
  type UsageFormState,
} from "./actions";
import { useTranslations } from "@/lib/i18n/client";

const initialState: UsageFormState = {};

export function UsageForm({
  feedTypes,
  usage,
}: {
  feedTypes: { id: string; nameEn: string }[];
  usage?: {
    id: string;
    feedTypeId: string;
    date: string;
    quantityKg: string;
    notes?: string;
  };
}) {
  const [state, formAction, pending] = useActionState(
    usage ? updateFeedUsageAction : logFeedUsageAction,
    initialState,
  );
  useActionToast(state?.error);
  const t = useTranslations();
  const today = new Date().toISOString().slice(0, 10);

  if (state?.needsConfirmation && state.formValues) {
    return (
      <form action={formAction} className="max-w-lg space-y-4">
        {usage && <input type="hidden" name="id" value={usage.id} />}
        <input type="hidden" name="feedTypeId" value={state.formValues.feedTypeId} />
        <input type="hidden" name="date" value={state.formValues.date} />
        <input
          type="hidden"
          name="quantityKg"
          value={state.formValues.quantityKg}
        />
        <input type="hidden" name="notes" value={state.formValues.notes ?? ""} />
        <input type="hidden" name="confirmed" value="true" />

        <Alert variant="destructive">
          <AlertDescription>
            {state.shortage && (
              <p>
                {t("feed.usage.shortageMsg", {
                  name: state.shortage.itemName,
                  requested: state.shortage.requestedKg,
                  available: state.shortage.availableKg.toFixed(2),
                  resulting: state.shortage.resultingKg.toFixed(2),
                })}
              </p>
            )}
          </AlertDescription>
        </Alert>

        <Button type="submit" variant="destructive" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? t("feed.usage.logging") : t("feed.usage.logAnyway")}
        </Button>
      </form>
    );
  }

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      {usage && <input type="hidden" name="id" value={usage.id} />}
      <div className="space-y-2">
        <Label htmlFor="feedTypeId">{t("feed.common.feedType")}</Label>
        {feedTypes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("feed.production.noRecipes")}
          </p>
        ) : (
          <NativeSelect
            id="feedTypeId"
            name="feedTypeId"
            required
            defaultValue={usage?.feedTypeId ?? ""}
          >
            {!usage && (
              <option value="" disabled>
                {t("feed.usage.selectFeedType")}
              </option>
            )}
            {feedTypes.map((feedType) => (
              <option key={feedType.id} value={feedType.id}>
                {feedType.nameEn}
              </option>
            ))}
          </NativeSelect>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">{t("common.date")}</Label>
        <Input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={usage?.date ?? today}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantityKg">{t("feed.usage.quantityUsedLabel")}</Label>
        <Input
          id="quantityKg"
          name="quantityKg"
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          required
          defaultValue={usage?.quantityKg}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("common.notes")}</Label>
        <Input
          id="notes"
          name="notes"
          placeholder={t("feed.usage.notesPlaceholder")}
          defaultValue={usage?.notes}
        />
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending || feedTypes.length === 0}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending
          ? t("feed.usage.logging")
          : usage
            ? t("feed.usage.saveUsage")
            : t("feed.usage.logNew")}
      </Button>
    </form>
  );
}
