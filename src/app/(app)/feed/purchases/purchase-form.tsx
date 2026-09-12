"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NativeSelect } from "@/components/ui/native-select";
import { useActionToast } from "@/hooks/use-action-toast";
import { useTranslations } from "@/lib/i18n/client";
import {
  recordPurchaseAction,
  updatePurchaseAction,
  type PurchaseFormState,
} from "./actions";

const initialState: PurchaseFormState = {};

export function PurchaseForm({
  materials,
  suppliers,
  purchase,
}: {
  materials: { id: string; nameEn: string }[];
  suppliers: { id: string; name: string }[];
  purchase?: {
    id: string;
    materialId: string;
    supplierId: string;
    date: string;
    enteredUnit: "KG" | "TON";
    enteredQuantity: string;
    totalCost: string;
    notes?: string;
  };
}) {
  const [state, formAction, pending] = useActionState(
    purchase ? updatePurchaseAction : recordPurchaseAction,
    initialState,
  );
  useActionToast(state?.error);
  const t = useTranslations();
  const today = new Date().toISOString().slice(0, 10);
  const canSubmit = materials.length > 0 && suppliers.length > 0;

  return (
    <form action={formAction} className="max-w-md space-y-5">
      {purchase && <input type="hidden" name="id" value={purchase.id} />}
      <div className="space-y-2">
        <Label htmlFor="materialId">{t("common.material")}</Label>
        {materials.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("feed.common.noMaterialsShort")}{" "}
            <Link href="/feed/materials/new" className="underline">
              {t("feed.common.addOneFirst")}
            </Link>
            .
          </p>
        ) : (
          <NativeSelect
            id="materialId"
            name="materialId"
            required
            defaultValue={purchase?.materialId ?? ""}
          >
            {!purchase && (
              <option value="" disabled>
                {t("common.select", { item: t("common.material") })}
              </option>
            )}
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.nameEn}
              </option>
            ))}
          </NativeSelect>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplierId">{t("common.supplier")}</Label>
        {suppliers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("feed.common.noContactsYet")}{" "}
            <Link href="/contacts/new" className="underline">
              {t("feed.common.addOneFirst")}
            </Link>
            .
          </p>
        ) : (
          <NativeSelect
            id="supplierId"
            name="supplierId"
            required
            defaultValue={purchase?.supplierId ?? ""}
          >
            {!purchase && (
              <option value="" disabled>
                {t("common.select", { item: t("common.supplier") })}
              </option>
            )}
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </NativeSelect>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">{t("common.date")}</Label>
        <Input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={purchase?.date ?? today}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="enteredQuantity">{t("common.quantity")}</Label>
          <Input
            id="enteredQuantity"
            name="enteredQuantity"
            type="number"
            step="0.001"
            min="0"
            inputMode="decimal"
            required
            defaultValue={purchase?.enteredQuantity}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="enteredUnit">{t("feed.materials.unitLabel")}</Label>
          <NativeSelect
            id="enteredUnit"
            name="enteredUnit"
            defaultValue={purchase?.enteredUnit ?? "KG"}
          >
            <option value="KG">KG</option>
            <option value="TON">Ton</option>
          </NativeSelect>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalCost">{t("feed.purchases.totalCostPaidLabel")}</Label>
        <Input
          id="totalCost"
          name="totalCost"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          required
          defaultValue={purchase?.totalCost}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("common.notes")}</Label>
        <Input id="notes" name="notes" defaultValue={purchase?.notes} />
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending || !canSubmit}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending
          ? t("common.saving")
          : purchase
            ? t("feed.purchases.savePurchase")
            : t("feed.purchases.recordPurchase")}
      </Button>
    </form>
  );
}
