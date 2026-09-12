"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useActionToast } from "@/hooks/use-action-toast";
import { saveCageAction, type CageFormState } from "./actions";

const initialState: CageFormState = {};

export function CageForm({
  cage,
}: {
  cage?: { id: string; name: string; currentChickenCount: number };
}) {
  const [state, formAction, pending] = useActionState(saveCageAction, initialState);
  useActionToast(state?.error);

  return (
    <form action={formAction} className="max-w-md space-y-5">
      {cage && <input type="hidden" name="id" value={cage.id} />}

      <div className="space-y-2">
        <Label htmlFor="name">Cage Name</Label>
        <Input
          id="name"
          name="name"
          required
          autoFocus
          placeholder="e.g. Cage 1"
          defaultValue={cage?.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentChickenCount">Chicken Count</Label>
        <Input
          id="currentChickenCount"
          name="currentChickenCount"
          type="number"
          step="1"
          min="0"
          inputMode="numeric"
          defaultValue={cage?.currentChickenCount ?? 0}
        />
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Saving…" : "Save Cage"}
      </Button>
    </form>
  );
}
