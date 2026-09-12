"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NativeSelect } from "@/components/ui/native-select";
import { useActionToast } from "@/hooks/use-action-toast";
import { useTranslations } from "@/lib/i18n/client";
import { recordEggSaleAction, type EggSaleFormState } from "./actions";

const initialState: EggSaleFormState = {};

export function EggSaleForm({
  boxTypes,
  buyers,
  defaultRatePerEgg,
}: {
  boxTypes: { id: string; name: string; eggsPerBox: number }[];
  buyers: { id: string; name: string }[];
  defaultRatePerEgg?: number | null;
}) {
  const [state, formAction, pending] = useActionState(
    recordEggSaleAction,
    initialState,
  );
  useActionToast(state?.error);
  const t = useTranslations();
  const today = new Date().toISOString().slice(0, 10);

  const [boxTypeId, setBoxTypeId] = useState("");
  const [boxCount, setBoxCount] = useState("0");
  const [looseEggCount, setLooseEggCount] = useState("0");
  const [ratePerEgg, setRatePerEgg] = useState(
    defaultRatePerEgg != null ? defaultRatePerEgg.toString() : "",
  );

  const selectedBoxType = boxTypes.find((b) => b.id === boxTypeId);
  const eggsFromBoxes = selectedBoxType
    ? (Number(boxCount) || 0) * selectedBoxType.eggsPerBox
    : 0;
  const totalEggs = eggsFromBoxes + (Number(looseEggCount) || 0);
  const totalAmount = totalEggs * (Number(ratePerEgg) || 0);

  if (state?.needsConfirmation && state.formValues) {
    return (
      <form action={formAction} className="max-w-lg space-y-4">
        <input type="hidden" name="buyerId" value={state.formValues.buyerId} />
        <input type="hidden" name="date" value={state.formValues.date} />
        <input
          type="hidden"
          name="boxTypeId"
          value={state.formValues.boxTypeId ?? ""}
        />
        <input type="hidden" name="boxCount" value={state.formValues.boxCount} />
        <input
          type="hidden"
          name="looseEggCount"
          value={state.formValues.looseEggCount}
        />
        <input
          type="hidden"
          name="ratePerEgg"
          value={state.formValues.ratePerEgg}
        />
        <input type="hidden" name="notes" value={state.formValues.notes ?? ""} />
        <input type="hidden" name="confirmed" value="true" />

        <Alert variant="destructive">
          <AlertDescription>
            {state.shortage && (
              <p>
                {t("eggs.sales.form.shortageMessage", {
                  requestedCount: state.shortage.requestedCount,
                  availableCount: state.shortage.availableCount,
                  resultingCount: state.shortage.resultingCount,
                })}
              </p>
            )}
          </AlertDescription>
        </Alert>

        <Button type="submit" variant="destructive" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? t("common.recording") : t("eggs.sales.sellAnyway")}
        </Button>
      </form>
    );
  }

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <div className="space-y-2">
        <Label htmlFor="buyerId">{t("common.buyer")}</Label>
        {buyers.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("eggs.sales.form.noContacts")}</p>
        ) : (
          <NativeSelect id="buyerId" name="buyerId" required defaultValue="">
            <option value="" disabled>
              {t("eggs.sales.selectBuyer")}
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
        <Input id="date" name="date" type="date" required defaultValue={today} />
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <p className="text-sm font-medium">{t("eggs.sales.boxes")}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="boxTypeId">{t("eggs.sales.form.boxTypeLabel")}</Label>
            <NativeSelect
              id="boxTypeId"
              name="boxTypeId"
              value={boxTypeId}
              onChange={(e) => setBoxTypeId(e.target.value)}
            >
              <option value="">{t("eggs.sales.form.noneOption")}</option>
              {boxTypes.map((boxType) => (
                <option key={boxType.id} value={boxType.id}>
                  {boxType.name}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label htmlFor="boxCount">{t("eggs.sales.form.boxCountLabel")}</Label>
            <Input
              id="boxCount"
              name="boxCount"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={boxCount}
              onChange={(e) => setBoxCount(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="looseEggCount">{t("eggs.sales.form.looseEggCountLabel")}</Label>
          <Input
            id="looseEggCount"
            name="looseEggCount"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={looseEggCount}
            onChange={(e) => setLooseEggCount(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ratePerEgg">{t("eggs.sales.form.ratePerEggLabel")}</Label>
        {defaultRatePerEgg != null && (
          <p className="text-xs text-muted-foreground">
            {t("eggs.sales.form.prefilledNote")}
          </p>
        )}
        <Input
          id="ratePerEgg"
          name="ratePerEgg"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          required
          value={ratePerEgg}
          onChange={(e) => setRatePerEgg(e.target.value)}
        />
      </div>

      <div className="space-y-1 rounded-lg bg-muted p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("eggs.sales.form.totalEggsLabel")}</span>
          <span className="font-medium">{totalEggs}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("eggs.sales.form.totalAmountLabel")}</span>
          <span className="font-medium">
            Rs.{" "}
            {totalAmount.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("common.notes")}</Label>
        <Input id="notes" name="notes" />
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending || buyers.length === 0}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? t("common.recording") : t("eggs.sales.recordSale")}
      </Button>
    </form>
  );
}
