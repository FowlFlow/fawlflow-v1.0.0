"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useActionToast } from "@/hooks/use-action-toast";
import {
  regenerateRecoveryCodeAction,
  type RegenerateCodeState,
} from "./actions";

const initialState: RegenerateCodeState = {};

export function RecoveryCodeForm() {
  const [state, formAction, pending] = useActionState(
    regenerateRecoveryCodeAction,
    initialState,
  );
  useActionToast(state?.error);
  useEffect(() => {
    if (state?.newCode) toast.success("New recovery code generated.");
  }, [state?.newCode]);

  return (
    <form action={formAction} className="max-w-sm space-y-3">
      {state?.newCode && (
        <Alert>
          <AlertDescription>
            <p className="mb-1 font-medium">
              New recovery code (save this now, it won&apos;t be shown again):
            </p>
            <p className="font-mono text-lg tracking-widest">
              {state.newCode}
            </p>
          </AlertDescription>
        </Alert>
      )}
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" variant="outline" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Generating…" : "Generate New Recovery Code"}
      </Button>
    </form>
  );
}
