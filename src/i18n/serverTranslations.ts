import { cookies } from "next/headers";
import en from "@/locales/en.json";
import al from "@/locales/al.json";

export type Locale = "en" | "al";

const DEFAULT_LOCALE: Locale = "al";

type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  al,
};

export async function getRequestLocale(): Promise<Locale> {
  const cookieValue = (await cookies()).get("language")?.value;
  if (cookieValue === "en" || cookieValue === "al") {
    return cookieValue;
  }
  return DEFAULT_LOCALE;
}

export async function getServerTranslations(locale?: Locale) {
  const resolvedLocale = locale ?? (await getRequestLocale());
  const dictionary = dictionaries[resolvedLocale] ?? dictionaries[DEFAULT_LOCALE];
  return (key: keyof typeof en) => {
    const value = dictionary[key];
    if (value) return value;
    const fallback = en[key];
    return fallback ?? String(key);
  };
}
