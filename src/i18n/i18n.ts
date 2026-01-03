
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import al from '../locales/al.json';

const resources = {
  en: { translation: en },
  al: { translation: al },
};

function getLangFromCookie() {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(/language=([a-zA-Z-]+)/);
  return match ? match[1] : 'en';
}

const isClient = typeof window !== 'undefined';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: isClient ? getLangFromCookie() : 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
