"use client";

import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language || "al");


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
    document.cookie = `language=${newLang}; path=/; max-age=31536000`;
  };

  return (
    <div className={className}>
      <label htmlFor="lang-switch" className="mr-2 text-xs text-gray-700 font-medium">Language:</label>
      <select
        id="lang-switch"
        value={lang}
        onChange={handleLanguageChange}
        className="border rounded px-2 py-1 text-xs"
      >
        <option value="al">Shqip</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
