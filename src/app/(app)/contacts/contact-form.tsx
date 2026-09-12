"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useActionToast } from "@/hooks/use-action-toast";
import { saveContactAction, type ContactFormState } from "./actions";

const initialState: ContactFormState = {};

export function ContactForm({
  contact,
}: {
  contact?: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
    isSupplier: boolean;
    isBuyer: boolean;
  };
}) {
  const [state, formAction, pending] = useActionState(
    saveContactAction,
    initialState,
  );
  useActionToast(state?.error);

  return (
    <form action={formAction} className="max-w-md space-y-5">
      {contact && <input type="hidden" name="id" value={contact.id} />}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          autoFocus
          defaultValue={contact?.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={contact?.phone ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={contact?.address ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isSupplier"
              defaultChecked={contact?.isSupplier}
              className="h-4 w-4 rounded border-input"
            />
            Supplier
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isBuyer"
              defaultChecked={contact?.isBuyer}
              className="h-4 w-4 rounded border-input"
            />
            Buyer
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          You don&apos;t have to set this now — it gets set automatically the
          first time you buy from or sell to this contact.
        </p>
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Saving…" : "Save Contact"}
      </Button>
    </form>
  );
}
