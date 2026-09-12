"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NativeSelect } from "@/components/ui/native-select";
import { useActionToast } from "@/hooks/use-action-toast";
import { saveMaterialAction, type MaterialFormState } from "./actions";

const initialState: MaterialFormState = {};

export function MaterialForm({
  material,
}: {
  material?: {
    id: string;
    nameEn: string;
    nameSi: string;
    unit: string;
    defaultSellPricePerKg: string;
  };
}) {
  const [state, formAction, pending] = useActionState(
    saveMaterialAction,
    initialState,
  );
  useActionToast(state?.error);

  return (
    <form action={formAction} className="max-w-md space-y-5">
      {material && <input type="hidden" name="id" value={material.id} />}

      <div className="space-y-2">
        <Label htmlFor="nameEn">Name (English)</Label>
        <Input
          id="nameEn"
          name="nameEn"
          required
          autoFocus
          defaultValue={material?.nameEn}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nameSi">Name (Sinhala)</Label>
        <Input
          id="nameSi"
          name="nameSi"
          lang="si"
          placeholder="Optional for now"
          defaultValue={material?.nameSi}
        />
        <p className="text-xs text-muted-foreground">
          Leave blank for now if you don&apos;t have the exact term yet — you
          can add it later.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unit</Label>
        <NativeSelect id="unit" name="unit" defaultValue={material?.unit ?? "KG"}>
          <option value="KG">KG</option>
          <option value="TON">Ton</option>
        </NativeSelect>
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultSellPricePerKg">
          Default Sell Price (per KG)
        </Label>
        <Input
          id="defaultSellPricePerKg"
          name="defaultSellPricePerKg"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          defaultValue={material?.defaultSellPricePerKg ?? "0"}
        />
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Saving…" : "Save Material"}
      </Button>
    </form>
  );
}
