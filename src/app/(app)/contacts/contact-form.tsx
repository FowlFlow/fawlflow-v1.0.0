"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useActionToast } from "@/hooks/use-action-toast";
import { useTranslations } from "@/lib/i18n/client";
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
  const t = useTranslations();

  return (
    <form action={formAction} className="max-w-md space-y-5">
      {contact && <input type="hidden" name="id" value={contact.id} />}

      <div className="space-y-2">
        <Label htmlFor="name">{t("common.name")}</Label>
        <Input
          id="name"
          name="name"
          required
          autoFocus
          defaultValue={contact?.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t("contacts.phone")}</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={contact?.phone ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">{t("contacts.address")}</Label>
        <Input id="address" name="address" defaultValue={contact?.address ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>{t("contacts.role")}</Label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isSupplier"
              defaultChecked={contact?.isSupplier}
              className="h-4 w-4 rounded border-input"
            />
            {t("common.supplier")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isBuyer"
              defaultChecked={contact?.isBuyer}
              className="h-4 w-4 rounded border-input"
            />
            {t("common.buyer")}
          </label>
        </div>
        <p className="text-xs text-muted-foreground">{t("contacts.roleHint")}</p>
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? t("common.saving") : t("contacts.submit")}
      </Button>
    </form>
  );
}
