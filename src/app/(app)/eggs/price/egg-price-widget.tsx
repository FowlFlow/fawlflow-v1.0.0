"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { useTranslations } from "@/lib/i18n/client";
import { setEggPriceAction, type EggPriceFormState } from "./actions";

const initialState: EggPriceFormState = {};

export function EggPriceWidget({ currentPrice }: { currentPrice: number | null }) {
  const [state, formAction, pending] = useActionState(
    setEggPriceAction,
    initialState,
  );
  const [editing, setEditing] = useState(false);
  const [priceInput, setPriceInput] = useState(currentPrice?.toString() ?? "");
  const [handledState, setHandledState] = useState(state);
  useActionToast(state?.error);
  const t = useTranslations();

  useEffect(() => {
    if (state?.success) toast.success(t("eggs.price.updatedToast"));
  }, [state, t]);

  if (state !== handledState) {
    setHandledState(state);
    if (state.success) setEditing(false);
  }

  function startEditing() {
    setPriceInput(currentPrice?.toString() ?? "");
    setEditing(true);
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{t("eggs.price.todaysPrice")}</p>
          <p className="text-2xl font-bold">
            {currentPrice != null ? `Rs. ${currentPrice.toFixed(2)}` : t("eggs.price.notSet")}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={startEditing}>
          <Pencil className="h-3.5 w-3.5" />
          {t("common.update")}
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <label htmlFor="pricePerEgg" className="text-sm text-muted-foreground">
        {t("eggs.price.perEggLabel")}
      </label>
      <div className="flex gap-2">
        <Input
          id="pricePerEgg"
          name="pricePerEgg"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          required
          autoFocus
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? t("common.saving") : t("common.save")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditing(false)}
          disabled={pending}
        >
          {t("common.cancel")}
        </Button>
      </div>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
