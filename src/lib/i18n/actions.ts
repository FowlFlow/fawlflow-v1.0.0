"use server";

import { cookies } from "next/headers";
import type { Locale } from "./types";
import { LOCALE_COOKIE } from "./server";

export async function setLocaleAction(locale: Locale) {
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
