import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ar from './locales/ar.json';
import en from './locales/en.json';

const resources = {
  ar: { translation: ar },
  en: { translation: en },
};

// Get saved locale or default to 'ar'
const getSavedLocale = (): string => {
  if (typeof window === 'undefined') return 'ar';

  // Check URL first
  const pathLocale = window.location.pathname.split('/')[1];
  if (pathLocale === 'ar' || pathLocale === 'en') {
    localStorage.setItem('locale', pathLocale);
    return pathLocale;
  }

  // Then localStorage
  return localStorage.getItem('locale') || 'ar';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getSavedLocale(),
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['path', 'localStorage'],
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
    },
  });

// Update document direction and language
export const updateDocumentDirection = (locale: string) => {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = locale;
  localStorage.setItem('locale', locale);
};

// Initialize direction on load
if (typeof window !== 'undefined') {
  updateDocumentDirection(getSavedLocale());
}

export default i18n;
