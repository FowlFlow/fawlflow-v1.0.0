"use client";

import { useActionState, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { useActionToast } from "@/hooks/use-action-toast";
import { recordSaleAction, type SaleFormState } from "./actions";

const initialState: SaleFormState = {};

interface SellableItem {
  id: string;
  nameEn: string;
  defaultSellPricePerKg: string;
}

export function SaleForm({
  feedTypes,
  materials,
  buyers,
}: {
  feedTypes: SellableItem[];
  materials: SellableItem[];
  buyers: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    recordSaleAction,
    initialState,
  );
  useActionToast(state?.error);
  const [saleType, setSaleType] = useState<"FEED" | "MATERIAL">(
    (state?.formValues?.saleType as "FEED" | "MATERIAL") ?? "FEED",
  );
  const priceInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().slice(0, 10);
  const items = saleType === "FEED" ? feedTypes : materials;

  function handleItemChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = items.find((item) => item.id === e.target.value);
    if (selected && priceInputRef.current) {
      priceInputRef.current.value = selected.defaultSellPricePerKg;
    }
  }

  if (state?.needsConfirmation && state.formValues) {
    return (
      <form action={formAction} className="max-w-lg space-y-4">
        <input type="hidden" name="saleType" value={state.formValues.saleType} />
        <input type="hidden" name="itemId" value={state.formValues.itemId} />
        <input type="hidden" name="buyerId" value={state.formValues.buyerId} />
        <input type="hidden" name="date" value={state.formValues.date} />
        <input
          type="hidden"
          name="quantityKg"
          value={state.formValues.quantityKg}
        />
        <input
          type="hidden"
          name="pricePerKg"
          value={state.formValues.pricePerKg}
        />
        <input type="hidden" name="notes" value={state.formValues.notes ?? ""} />
        <input type="hidden" name="confirmed" value="true" />

        <Alert variant="destructive">
          <AlertDescription>
            {state.shortage && (
              <p>
                {state.shortage.itemName}: selling {state.shortage.requestedKg}{" "}
                kg but only {state.shortage.availableKg.toFixed(2)} kg in stock
                ({state.shortage.resultingKg.toFixed(2)} kg after this)
              </p>
            )}
          </AlertDescription>
        </Alert>

        <Button type="submit" variant="destructive" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? "Recording…" : "Sell Anyway"}
        </Button>
      </form>
    );
  }

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <div className="space-y-2">
        <Label>What are you selling?</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSaleType("FEED")}
            className={cn(
              "flex-1 rounded-lg border px-3 py-2 text-sm font-medium",
              saleType === "FEED"
                ? "border-primary bg-secondary text-secondary-foreground"
                : "text-muted-foreground",
            )}
          >
            Feed
          </button>
          <button
            type="button"
            onClick={() => setSaleType("MATERIAL")}
            className={cn(
              "flex-1 rounded-lg border px-3 py-2 text-sm font-medium",
              saleType === "MATERIAL"
                ? "border-primary bg-secondary text-secondary-foreground"
                : "text-muted-foreground",
            )}
          >
            Raw Material
          </button>
        </div>
        <input type="hidden" name="saleType" value={saleType} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="itemId">
          {saleType === "FEED" ? "Feed Type" : "Material"}
        </Label>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            None available yet.
          </p>
        ) : (
          <NativeSelect
            id="itemId"
            name="itemId"
            required
            defaultValue=""
            onChange={handleItemChange}
            key={saleType}
          >
            <option value="" disabled>
              Select {saleType === "FEED" ? "a feed type" : "a material"}
            </option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nameEn}
              </option>
            ))}
          </NativeSelect>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="buyerId">Buyer</Label>
        {buyers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contacts yet.</p>
        ) : (
          <NativeSelect id="buyerId" name="buyerId" required defaultValue="">
            <option value="" disabled>
              Select a buyer
            </option>
            {buyers.map((buyer) => (
              <option key={buyer.id} value={buyer.id}>
                {buyer.name}
              </option>
            ))}
          </NativeSelect>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" required defaultValue={today} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="quantityKg">Quantity (kg)</Label>
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
          <Label htmlFor="pricePerKg">Price per KG (Rs.)</Label>
          <Input
            ref={priceInputRef}
            id="pricePerKg"
            name="pricePerKg"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            required
          />
        </div>
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

      <Button
        type="submit"
        disabled={pending || items.length === 0 || buyers.length === 0}
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Recording…" : "Record Sale"}
      </Button>
    </form>
  );
}
