"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NativeSelect } from "@/components/ui/native-select";
import { useActionToast } from "@/hooks/use-action-toast";
import { produceBatchAction, type ProduceBatchState } from "./actions";

const initialState: ProduceBatchState = {};

export function ProduceBatchForm({
  feedTypes,
}: {
  feedTypes: { id: string; nameEn: string; batchSizeKg: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    produceBatchAction,
    initialState,
  );
  useActionToast(state?.error);
  const today = new Date().toISOString().slice(0, 10);

  if (state?.needsConfirmation && state.formValues) {
    return (
      <form action={formAction} className="max-w-lg space-y-4">
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
              This would leave these materials short:
            </p>
            <ul className="list-inside list-disc space-y-1">
              {state.shortages?.map((shortage) => (
                <li key={shortage.materialName}>
                  {shortage.materialName}: needs {shortage.requiredKg.toFixed(2)}{" "}
                  kg, only {shortage.availableKg.toFixed(2)} kg in stock (
                  {shortage.resultingKg.toFixed(2)} kg after this)
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button type="submit" variant="destructive" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? "Producing…" : "Produce Anyway"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <div className="space-y-2">
        <Label htmlFor="feedTypeId">Feed Type</Label>
        {feedTypes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recipes yet — create one first.
          </p>
        ) : (
          <NativeSelect id="feedTypeId" name="feedTypeId" required defaultValue="">
            <option value="" disabled>
              Select a feed type
            </option>
            {feedTypes.map((feedType) => (
              <option key={feedType.id} value={feedType.id}>
                {feedType.nameEn} (batch: {feedType.batchSizeKg}kg)
              </option>
            ))}
          </NativeSelect>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" required defaultValue={today} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantityProducedKg">Quantity to Produce (kg)</Label>
        <Input
          id="quantityProducedKg"
          name="quantityProducedKg"
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" />
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending || feedTypes.length === 0}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Producing…" : "Produce Batch"}
      </Button>
    </form>
  );
}
