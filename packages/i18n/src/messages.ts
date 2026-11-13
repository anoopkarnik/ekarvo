// Brings use-intl into every program that imports this file, so the
// AppConfig augmentation below always has a module to attach to.
import type {} from "use-intl";
import type { Locale } from "./config";
import en from "./messages/en/index";
import es from "./messages/es/index";

export type Messages = typeof en;

declare module "use-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}

const cache = new Map<
  Locale,
  { english: Messages; catalogue: unknown; messages: Messages }
>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeOver(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = merged[key];
    merged[key] =
      isRecord(current) && isRecord(value) ? mergeOver(current, value) : value;
  }
  return merged;
}

/** A locale's catalogue over English, so a missing translation shows English, never a key. */
export function getMessages(locale: Locale): Messages {
  const catalogue = locale === "en" ? en : es;
  let cached = cache.get(locale);
  // Translation modules can be replaced by HMR while this module stays loaded.
  // Cache only while both source identities still match.
  if (!cached || cached.english !== en || cached.catalogue !== catalogue) {
    const messages = (
      locale === "en" ? en : mergeOver(en, catalogue as Record<string, unknown>)
    ) as Messages;
    cached = { english: en, catalogue, messages };
    cache.set(locale, cached);
  }
  return cached.messages;
}
