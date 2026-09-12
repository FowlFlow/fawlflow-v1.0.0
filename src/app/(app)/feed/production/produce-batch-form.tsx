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
import {
  produceBatchAction,
  updateProductionBatchAction,
  type ProduceBatchState,
} from "./actions";

const initialState: ProduceBatchState = {};

export function ProduceBatchForm({
  feedTypes,
  batch,
}: {
  feedTypes: { id: string; nameEn: string; batchSizeKg: string }[];
  batch?: {
    id: string;
    feedTypeId: string;
    date: string;
    quantityProducedKg: string;
    notes?: string;
  };
}) {
  const [state, formAction, pending] = useActionState(
    batch ? updateProductionBatchAction : produceBatchAction,
    initialState,
  );
  useActionToast(state?.error);
  const t = useTranslations();
  const today = new Date().toISOString().slice(0, 10);

  if (state?.needsConfirmation && state.formValues) {
    return (
      <form action={formAction} className="max-w-lg space-y-4">
        {batch && <input type="hidden" name="id" value={batch.id} />}
        <input type="hidden" name="feedTypeId" value={state.formValues.feedTypeId} />
        <input type="hidden" name="date" value={state.formValues.date} />
        <input
          type="hidden"
          name="quantityProducedKg"
          value={state.formValues.quantityProducedKg}
        />
        <input type="hidden" name="notes" value={state.formValues.notes ?? ""} />
        <input type="hidden" name="confirmed" value="true" />

        <Alert variant="destructive">
          <AlertDescription>
            <p className="mb-2 font-medium">
              {t("feed.production.shortageIntro")}
            </p>
            <ul className="list-inside list-disc space-y-1">
              {state.shortages?.map((shortage) => (
                <li key={shortage.materialName}>
                  {t("feed.production.shortageLine", {
                    name: shortage.materialName,
                    required: shortage.requiredKg.toFixed(2),
                    available: shortage.availableKg.toFixed(2),
                    resulting: shortage.resultingKg.toFixed(2),
                  })}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button type="submit" variant="destructive" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? t("feed.production.producing") : t("common.proceedAnyway")}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      {batch && <input type="hidden" name="id" value={batch.id} />}
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
            defaultValue={batch?.feedTypeId ?? ""}
          >
            {!batch && (
              <option value="" disabled>
                {t("common.select", { item: t("feed.common.feedType") })}
              </option>
            )}
            {feedTypes.map((feedType) => (
              <option key={feedType.id} value={feedType.id}>
                {t("feed.production.feedTypeOption", {
                  name: feedType.nameEn,
                  size: feedType.batchSizeKg,
                })}
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
          defaultValue={batch?.date ?? today}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantityProducedKg">
          {t("feed.production.quantityToProduce")}
        </Label>
        <Input
          id="quantityProducedKg"
          name="quantityProducedKg"
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          required
          defaultValue={batch?.quantityProducedKg}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("common.notes")}</Label>
        <Input id="notes" name="notes" defaultValue={batch?.notes} />
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending || feedTypes.length === 0}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending
          ? t("feed.production.producing")
          : batch
            ? t("feed.production.saveBatch")
            : t("feed.production.produceBatch")}
      </Button>
    </form>
  );
}
