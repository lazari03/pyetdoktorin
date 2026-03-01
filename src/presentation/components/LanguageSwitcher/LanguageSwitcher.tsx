"use client";

import { useTranslation } from "react-i18next";
import { useId, useState, useEffect } from "react";
import { setLanguageCookie } from "@/presentation/utils/clientCookies";
import { useRouter } from "next/navigation";

export default function LanguageSwitcher({
  className = "",
  label,
}: {
  className?: string;
  label?: string;
}) {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language || "al");
  const id = useId();
  const router = useRouter();

  useEffect(() => {
    const onLangChanged = (lng: string) => setLang(lng);
    i18n.on('languageChanged', onLangChanged);
    return () => {
      i18n.off('languageChanged', onLangChanged);
    };
  }, [i18n]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLang(newLang);
    i18n.changeLanguage(newLang);
    setLanguageCookie(newLang);
    router.refresh();
  };

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
        {label ?? t('language') ?? 'Language'}
      </label>
      <select
        id={id}
        value={lang}
        onChange={handleLanguageChange}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
      >
        <option value="al">{`🇦🇱 ${t('albanian') || 'Shqip'}`}</option>
        <option value="en">{`🇺🇸 ${t('english') || 'English'}`}</option>
      </select>
    </div>
  );
}
