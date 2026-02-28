import { cookies } from "next/headers";
import en from "@/locales/en.json";
import al from "@/locales/al.json";
import { LANGUAGE_COOKIE_NAME } from "@/config/cookies";

export type Locale = "en" | "al";

const DEFAULT_LOCALE: Locale = "al";

type Dictionary = typeof en;
type TranslationKey = keyof Dictionary;
type TranslationValue<K extends TranslationKey> = Dictionary[K];

const dictionaries: Record<Locale, Dictionary> = {
  en,
  al,
};

export async function getRequestLocale(): Promise<Locale> {
  const cookieValue = (await cookies()).get(LANGUAGE_COOKIE_NAME)?.value;
  if (cookieValue === "en" || cookieValue === "al") {
    return cookieValue;
  }
  return DEFAULT_LOCALE;
}

export async function getServerTranslations(locale?: Locale) {
  const resolvedLocale = locale ?? (await getRequestLocale());
  const dictionary = dictionaries[resolvedLocale] ?? dictionaries[DEFAULT_LOCALE];
  return <K extends TranslationKey>(key: K): TranslationValue<K> => {
    const value = dictionary[key];
    if (typeof value !== "undefined") return value as TranslationValue<K>;
    const fallback = en[key];
    return (fallback ?? String(key)) as TranslationValue<K>;
  };
}
