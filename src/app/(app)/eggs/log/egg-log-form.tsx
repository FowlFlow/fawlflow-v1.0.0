"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useActionToast } from "@/hooks/use-action-toast";
import { useTranslations } from "@/lib/i18n/client";
import { saveEggLogAction, type EggLogFormState } from "./actions";

const initialState: EggLogFormState = {};

export function EggLogForm({
  cages,
  turns,
  date,
}: {
  cages: { id: string; name: string }[];
  turns: { id: string; name: string }[];
  date: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    saveEggLogAction,
    initialState,
  );
  useActionToast(state?.error);
  const t = useTranslations();
  useEffect(() => {
    if (state?.savedAt) {
      toast.success(t("eggs.log.savedToast"));
      formRef.current?.reset();
    }
  }, [state?.savedAt, t]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label htmlFor="date-picker" className="text-sm font-medium">
          {t("common.date")}
        </label>
        <input
          id="date-picker"
          type="date"
          defaultValue={date}
          onChange={(e) => router.push(`/eggs/log?date=${e.target.value}`)}
          className="h-11 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <form ref={formRef} action={formAction} className="space-y-4">
        <input type="hidden" name="date" value={date} />
        <p className="text-xs text-muted-foreground">{t("eggs.log.gridHelp")}</p>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left font-medium">{t("eggs.log.cageColumn")}</th>
                {turns.map((turn) => (
                  <th key={turn.id} className="p-2 text-left font-medium">
                    {turn.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cages.map((cage) => (
                <tr key={cage.id} className="border-b last:border-0">
                  <td className="p-2 font-medium whitespace-nowrap">
                    {cage.name}
                  </td>
                  {turns.map((turn) => (
                    <td key={turn.id} className="p-2">
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        name={`cell:${cage.id}:${turn.id}`}
                        className="w-20"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {state?.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? t("common.saving") : t("common.save")}
        </Button>
      </form>
    </div>
  );
}
