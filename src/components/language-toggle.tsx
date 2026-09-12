"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/client";
import { setLocaleAction } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale || pending) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center rounded-full border p-0.5 text-xs font-semibold"
    >
      <button
        type="button"
        onClick={() => choose("si")}
        aria-pressed={locale === "si"}
        disabled={pending}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          locale === "si"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground",
        )}
      >
        සිං
      </button>
      <button
        type="button"
        onClick={() => choose("en")}
        aria-pressed={locale === "en"}
        disabled={pending}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          locale === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground",
        )}
      >
        EN
      </button>
    </div>
  );
}
