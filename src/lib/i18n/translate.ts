import type { Dict, Locale } from "./types";
import { dictionaries } from "./dictionary";

export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const parts = key.split(".");
  let node: Dict[string] = dictionaries[locale];

  for (const part of parts) {
    if (typeof node !== "object" || node === undefined) break;
    node = node[part];
  }

  let result = typeof node === "string" ? node : key;

  if (vars) {
    for (const [varKey, value] of Object.entries(vars)) {
      result = result.replaceAll(`{${varKey}}`, String(value));
    }
  }

  return result;
}

export type Translate = (
  key: string,
  vars?: Record<string, string | number>,
) => string;
