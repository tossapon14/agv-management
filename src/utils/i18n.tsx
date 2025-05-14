import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
i18n
  .use(Backend)
  .use(LanguageDetector) // detect language and use localStorage
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    ns: [ 'login','home',"vehicle","mission","drawer" ],  // multiple namespaces
    defaultNS: 'login',
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json', // e.g., /locales/en/home.json
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // save language to localStorage
      lookupLocalStorage: 'BGLanguage'
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;