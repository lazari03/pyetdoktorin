
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json' assert { type: 'json' };
import al from '../locales/al.json' assert { type: 'json' };


const resources = {
  en: { translation: en },
  al: { translation: al },
};

function getLangFromCookie() {
  if (typeof document === 'undefined') return 'al';
  const match = document.cookie.match(/language=([a-zA-Z-]+)/);
  return match ? match[1] : 'al';
}

const isClient = typeof window !== 'undefined';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: isClient ? getLangFromCookie() : 'al',
    fallbackLng: 'al',
    interpolation: { escapeValue: false },
  });

export default i18n;
