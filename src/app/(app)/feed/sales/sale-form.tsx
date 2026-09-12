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
import { recordSaleAction, updateSaleAction, type SaleFormState } from "./actions";
import { useTranslations } from "@/lib/i18n/client";

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
  sale,
}: {
  feedTypes: SellableItem[];
  materials: SellableItem[];
  buyers: { id: string; name: string }[];
  sale?: {
    id: string;
    saleType: "FEED" | "MATERIAL";
    itemId: string;
    buyerId: string;
    date: string;
    quantityKg: string;
    pricePerKg: string;
    notes?: string;
  };
}) {
  const [state, formAction, pending] = useActionState(
    sale ? updateSaleAction : recordSaleAction,
    initialState,
  );
  useActionToast(state?.error);
  const t = useTranslations();
  const [saleType, setSaleType] = useState<"FEED" | "MATERIAL">(
    sale?.saleType ?? (state?.formValues?.saleType as "FEED" | "MATERIAL") ?? "FEED",
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
        {sale && <input type="hidden" name="id" value={sale.id} />}
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
                {t("feed.sales.shortageMsg", {
                  name: state.shortage.itemName,
                  requested: state.shortage.requestedKg,
                  available: state.shortage.availableKg.toFixed(2),
                  resulting: state.shortage.resultingKg.toFixed(2),
                })}
              </p>
            )}
          </AlertDescription>
        </Alert>

        <Button type="submit" variant="destructive" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? t("common.recording") : t("feed.sales.sellAnyway")}
        </Button>
      </form>
    );
  }

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      {sale && <input type="hidden" name="id" value={sale.id} />}
      <div className="space-y-2">
        <Label>{t("feed.sales.whatSelling")}</Label>
        {sale ? (
          <div className="w-fit rounded-lg border border-primary bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">
            {saleType === "FEED" ? t("feed.common.feedBadge") : t("common.material")}
          </div>
        ) : (
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
              {t("feed.common.feedBadge")}
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
              {t("feed.sales.materialToggle")}
            </button>
          </div>
        )}
        <input type="hidden" name="saleType" value={saleType} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="itemId">
          {saleType === "FEED" ? t("feed.common.feedType") : t("common.material")}
        </Label>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("feed.common.noneAvailable")}
          </p>
        ) : (
          <NativeSelect
            id="itemId"
            name="itemId"
            required
            defaultValue={sale?.itemId ?? ""}
            onChange={handleItemChange}
            key={saleType}
          >
            <option value="" disabled>
              {saleType === "FEED"
                ? t("feed.sales.selectFeedTypeOption")
                : t("feed.sales.selectMaterialOption")}
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
        <Label htmlFor="buyerId">{t("common.buyer")}</Label>
        {buyers.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("feed.common.noContactsYet")}</p>
        ) : (
          <NativeSelect id="buyerId" name="buyerId" required defaultValue={sale?.buyerId ?? ""}>
            <option value="" disabled>
              {t("feed.sales.selectBuyer")}
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
        <Label htmlFor="date">{t("common.date")}</Label>
        <Input id="date" name="date" type="date" required defaultValue={sale?.date ?? today} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="quantityKg">{t("common.quantityKg")}</Label>
          <Input
            id="quantityKg"
            name="quantityKg"
            type="number"
            step="0.001"
            min="0"
            inputMode="decimal"
            required
            defaultValue={sale?.quantityKg}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pricePerKg">{t("common.pricePerKg")}</Label>
          <Input
            ref={priceInputRef}
            id="pricePerKg"
            name="pricePerKg"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            required
            defaultValue={sale?.pricePerKg}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("common.notes")}</Label>
        <Input id="notes" name="notes" defaultValue={sale?.notes} />
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
        {pending
          ? t("common.recording")
          : sale
            ? t("feed.sales.saveSale")
            : t("feed.sales.recordSale")}
      </Button>
    </form>
  );
}
