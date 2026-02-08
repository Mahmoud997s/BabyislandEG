import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './locales/ar.json';
import en from './locales/en.json';

// Supported locales
export const SUPPORTED_LOCALES = ['ar', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ar';

// Translation resources
const resources = {
  ar: { translation: ar },
  en: { translation: en },
};

// SSR-safe locale detection
// On server: returns default locale (actual locale set via x-locale header in layout)
// On client: reads from URL path
export const getLocaleFromPath = (): Locale => {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const pathSegments = window.location.pathname.split('/');
  const pathLocale = pathSegments[1];

  if (SUPPORTED_LOCALES.includes(pathLocale as Locale)) {
    return pathLocale as Locale;
  }

  return DEFAULT_LOCALE;
};

// Initialize i18next - SSR safe
// Uses default locale on server, syncs to URL on client via layout
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: DEFAULT_LOCALE, // Default for SSR, client syncs via layout
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },
  });

// Change language helper - call this from client components
export const changeLocale = (locale: Locale): void => {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    console.warn(`Unsupported locale: ${locale}`);
    return;
  }

  i18n.changeLanguage(locale);

  // Sync to localStorage for persistence (client-only)
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
    // Set cookie for middleware to see
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  }
};

// Get text direction for a locale
export const getDirection = (locale: Locale): 'rtl' | 'ltr' => {
  return locale === 'ar' ? 'rtl' : 'ltr';
};

export default i18n;
