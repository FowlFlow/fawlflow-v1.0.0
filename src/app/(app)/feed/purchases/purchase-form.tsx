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
import { recordPurchaseAction, type PurchaseFormState } from "./actions";

const initialState: PurchaseFormState = {};

export function PurchaseForm({
  materials,
  suppliers,
}: {
  materials: { id: string; nameEn: string }[];
  suppliers: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    recordPurchaseAction,
    initialState,
  );
  useActionToast(state?.error);
  const today = new Date().toISOString().slice(0, 10);
  const canSubmit = materials.length > 0 && suppliers.length > 0;

  return (
    <form action={formAction} className="max-w-md space-y-5">
      <div className="space-y-2">
        <Label htmlFor="materialId">Material</Label>
        {materials.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No materials yet.{" "}
            <Link href="/feed/materials/new" className="underline">
              Add one first
            </Link>
            .
          </p>
        ) : (
          <NativeSelect id="materialId" name="materialId" required defaultValue="">
            <option value="" disabled>
              Select a material
            </option>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.nameEn}
              </option>
            ))}
          </NativeSelect>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplierId">Supplier</Label>
        {suppliers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No contacts yet.{" "}
            <Link href="/contacts/new" className="underline">
              Add one first
            </Link>
            .
          </p>
        ) : (
          <NativeSelect id="supplierId" name="supplierId" required defaultValue="">
            <option value="" disabled>
              Select a supplier
            </option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
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
          <Label htmlFor="enteredQuantity">Quantity</Label>
          <Input
            id="enteredQuantity"
            name="enteredQuantity"
            type="number"
            step="0.001"
            min="0"
            inputMode="decimal"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="enteredUnit">Unit</Label>
          <NativeSelect id="enteredUnit" name="enteredUnit" defaultValue="KG">
            <option value="KG">KG</option>
            <option value="TON">Ton</option>
          </NativeSelect>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalCost">Total Cost Paid (Rs.)</Label>
        <Input
          id="totalCost"
          name="totalCost"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          required
        />
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

      <Button type="submit" disabled={pending || !canSubmit}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Saving…" : "Record Purchase"}
      </Button>
    </form>
  );
}
