import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18next
  .use(initReactI18next)
  .use(HttpApi)
  .use(LanguageDetector)
  .init({
    load: 'languageOnly',
    supportedLngs: ['de', 'en', 'es', 'fr', 'pt'],
    fallbackLng: 'en',
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    // debug: process.env.NODE_ENV === "development",
  });
export default i18next;
