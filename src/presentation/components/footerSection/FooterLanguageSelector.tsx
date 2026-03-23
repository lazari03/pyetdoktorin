"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLanguageCookie } from "@/presentation/utils/clientCookies";

type FooterLanguageOption = {
  code: "en" | "al";
  label: string;
};

export default function FooterLanguageSelector({
  currentLocale,
  label,
  options,
}: {
  currentLocale: "en" | "al";
  label: string;
  options: FooterLanguageOption[];
}) {
  const router = useRouter();
  const [locale, setLocale] = useState(currentLocale);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocale(currentLocale);
  }, [currentLocale]);

  return (
    <>
      <label htmlFor="footer-lang" className="sr-only">
        {label}
      </label>
      <select
        id="footer-lang"
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
        value={locale}
        disabled={isPending}
        onChange={(event) => {
          const nextLocale = event.target.value as "en" | "al";
          setLocale(nextLocale);
          setLanguageCookie(nextLocale);
          startTransition(() => {
            router.refresh();
          });
        }}
      >
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
}
