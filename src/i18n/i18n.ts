
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json' assert { type: 'json' };
import al from '../locales/al.json' assert { type: 'json' };
import { getLanguageCookie } from '@/presentation/utils/clientCookies';


const resources = {
  en: { translation: en },
  al: { translation: al },
};

function getLangFromCookie() {
  return getLanguageCookie() ?? 'al';
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
