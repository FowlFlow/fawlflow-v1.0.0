"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useActionToast } from "@/hooks/use-action-toast";
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

  return (
    <form action={formAction} className="max-w-md space-y-5">
      {turn && <input type="hidden" name="id" value={turn.id} />}

      <div className="space-y-2">
        <Label htmlFor="name">Turn Name</Label>
        <Input
          id="name"
          name="name"
          required
          autoFocus
          placeholder="e.g. Morning"
          defaultValue={turn?.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Order</Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          step="1"
          inputMode="numeric"
          defaultValue={turn?.sortOrder ?? 0}
        />
        <p className="text-xs text-muted-foreground">
          Lower numbers show first on the Log Eggs screen.
        </p>
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Saving…" : "Save Turn"}
      </Button>
    </form>
  );
}
