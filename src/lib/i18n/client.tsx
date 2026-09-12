"use client";

import { createContext, useCallback, useContext } from "react";
import type { Locale } from "./types";
import { translate } from "./translate";

const LocaleContext = createContext<Locale>("si");

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useTranslations() {
  const locale = useLocale();
  return useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale],
  );
}
