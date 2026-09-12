"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NativeSelect } from "@/components/ui/native-select";
import { useActionToast } from "@/hooks/use-action-toast";
import { logFeedUsageAction, type UsageFormState } from "./actions";

const initialState: UsageFormState = {};

export function UsageForm({
  feedTypes,
}: {
  feedTypes: { id: string; nameEn: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    logFeedUsageAction,
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
          name="quantityKg"
          value={state.formValues.quantityKg}
        />
        <input type="hidden" name="notes" value={state.formValues.notes ?? ""} />
        <input type="hidden" name="confirmed" value="true" />

        <Alert variant="destructive">
          <AlertDescription>
            {state.shortage && (
              <p>
                {state.shortage.itemName}: using {state.shortage.requestedKg} kg
                but only {state.shortage.availableKg.toFixed(2)} kg in stock (
                {state.shortage.resultingKg.toFixed(2)} kg after this)
              </p>
            )}
          </AlertDescription>
        </Alert>

        <Button type="submit" variant="destructive" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? "Logging…" : "Log Anyway"}
        </Button>
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
                {feedType.nameEn}
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
        <Label htmlFor="quantityKg">Quantity Used (kg)</Label>
        <Input
          id="quantityKg"
          name="quantityKg"
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" placeholder="e.g. which cage" />
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending || feedTypes.length === 0}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Logging…" : "Log Farm Use"}
      </Button>
    </form>
  );
}
