"use client";

import { useActionState, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NativeSelect } from "@/components/ui/native-select";
import { useActionToast } from "@/hooks/use-action-toast";
import { saveFeedTypeAction, type FeedTypeFormState } from "./actions";
import { useTranslations } from "@/lib/i18n/client";

const initialState: FeedTypeFormState = {};

interface RecipeRow {
  key: string;
  materialId?: string;
  quantityPerBatchKg?: string;
}

export function FeedTypeForm({
  materials,
  feedType,
}: {
  materials: { id: string; nameEn: string }[];
  feedType?: {
    id: string;
    nameEn: string;
    nameSi: string;
    batchSizeKg: string;
    defaultSellPricePerKg: string;
    recipeItems: { materialId: string; quantityPerBatchKg: string }[];
  };
}) {
  const [state, formAction, pending] = useActionState(
    saveFeedTypeAction,
    initialState,
  );
  useActionToast(state?.error);
  const t = useTranslations();

  const [rows, setRows] = useState<RecipeRow[]>(() =>
    feedType && feedType.recipeItems.length > 0
      ? feedType.recipeItems.map((item, i) => ({
          key: `existing-${i}`,
          materialId: item.materialId,
          quantityPerBatchKg: item.quantityPerBatchKg,
        }))
      : [{ key: "row-0" }],
  );

  function addRow() {
    setRows((r) => [...r, { key: `row-${Date.now()}` }]);
  }

  function removeRow(key: string) {
    setRows((r) => (r.length > 1 ? r.filter((row) => row.key !== key) : r));
  }

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      {feedType && <input type="hidden" name="id" value={feedType.id} />}

      <div className="space-y-2">
        <Label htmlFor="nameEn">{t("feed.materials.nameEnLabel")}</Label>
        <Input
          id="nameEn"
          name="nameEn"
          required
          autoFocus
          placeholder={t("feed.types.namePlaceholder")}
          defaultValue={feedType?.nameEn}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nameSi">{t("feed.materials.nameSiLabel")}</Label>
        <Input
          id="nameSi"
          name="nameSi"
          lang="si"
          placeholder={t("feed.common.optionalForNow")}
          defaultValue={feedType?.nameSi}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="batchSizeKg">{t("feed.types.batchSizeLabel")}</Label>
        <Input
          id="batchSizeKg"
          name="batchSizeKg"
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          placeholder={t("feed.types.batchSizePlaceholder")}
          required
          defaultValue={feedType?.batchSizeKg}
        />
        <p className="text-xs text-muted-foreground">
          {t("feed.types.batchSizeHelp")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultSellPricePerKg">
          {t("feed.common.defaultSellPricePerKgLabel")}
        </Label>
        <Input
          id="defaultSellPricePerKg"
          name="defaultSellPricePerKg"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          defaultValue={feedType?.defaultSellPricePerKg ?? "0"}
        />
      </div>

      <div className="space-y-2">
        <Label>{t("feed.types.ingredientsLabel")}</Label>
        {materials.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("feed.types.noMaterialsForRecipe")}
          </p>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <div key={row.key} className="flex items-center gap-2">
                <NativeSelect
                  name="materialId[]"
                  required
                  defaultValue={row.materialId ?? ""}
                  className="flex-1"
                >
                  <option value="" disabled>
                    {t("common.select", { item: t("common.material") })}
                  </option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.nameEn}
                    </option>
                  ))}
                </NativeSelect>
                <Input
                  name="quantityPerBatchKg[]"
                  type="number"
                  step="0.001"
                  min="0"
                  inputMode="decimal"
                  placeholder="kg"
                  required
                  defaultValue={row.quantityPerBatchKg}
                  className="w-24 shrink-0"
                />
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={t("feed.types.removeIngredientAria")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              className="text-sm text-primary underline underline-offset-2"
            >
              + {t("feed.types.addIngredientWord")}
            </button>
          </div>
        )}
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending || materials.length === 0}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? t("common.saving") : t("feed.types.saveRecipe")}
      </Button>
    </form>
  );
}
