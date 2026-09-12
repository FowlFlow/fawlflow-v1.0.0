"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { useTranslations } from "@/lib/i18n/client";
import { updateSellingPricesAction, type UpdatePricesState } from "./actions";

const initialState: UpdatePricesState = {};

interface PricedItem {
  id: string;
  nameEn: string;
  nameSi: string;
  defaultSellPricePerKg: string;
}

function PriceRow({ item, prefix }: { item: PricedItem; prefix: "material" | "feedType" }) {
  const fieldName = `${prefix}:${item.id}`;
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={fieldName} className="flex-1 font-normal">
        {item.nameEn}
        {item.nameSi && item.nameSi !== item.nameEn && (
          <span className="ml-2 text-muted-foreground" lang="si">
            ({item.nameSi})
          </span>
        )}
      </Label>
      <Input
        id={fieldName}
        name={fieldName}
        type="number"
        step="0.01"
        min="0"
        inputMode="decimal"
        defaultValue={item.defaultSellPricePerKg}
        className="w-28 shrink-0"
      />
    </div>
  );
}

export function PricesForm({
  materials,
  feedTypes,
}: {
  materials: PricedItem[];
  feedTypes: PricedItem[];
}) {
  const [state, formAction, pending] = useActionState(
    updateSellingPricesAction,
    initialState,
  );
  useActionToast(state?.error);
  const t = useTranslations();

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-3 rounded-lg border p-4">
        <h2 className="font-semibold">{t("feed.prices.rawMaterialsHeader")}</h2>
        {materials.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("feed.common.noMaterialsShort")}
          </p>
        ) : (
          materials.map((m) => <PriceRow key={m.id} item={m} prefix="material" />)
        )}
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <h2 className="font-semibold">{t("feed.prices.feedTypesHeader")}</h2>
        {feedTypes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("feed.common.noFeedTypesShort")}
          </p>
        ) : (
          feedTypes.map((f) => <PriceRow key={f.id} item={f} prefix="feedType" />)
        )}
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? t("common.saving") : t("feed.prices.saveAllPrices")}
      </Button>
    </form>
  );
}
