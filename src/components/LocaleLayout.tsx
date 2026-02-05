import { useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { updateDocumentDirection } from '@/i18n';

type Locale = 'ar' | 'en';

const SUPPORTED_LOCALES: Locale[] = ['ar', 'en'];

export function LocaleLayout() {
    const { locale } = useParams<{ locale: string }>();
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Validate locale
        if (!locale || !SUPPORTED_LOCALES.includes(locale as Locale)) {
            const savedLocale = localStorage.getItem('locale') || 'ar';
            navigate(`/${savedLocale}${location.pathname}${location.search}`, { replace: true });
            return;
        }

        // Update i18n language
        if (i18n.language !== locale) {
            i18n.changeLanguage(locale);
        }

        // Update document direction
        updateDocumentDirection(locale);
    }, [locale, i18n, navigate, location]);

    // Don't render until we have a valid locale
    if (!locale || !SUPPORTED_LOCALES.includes(locale as Locale)) {
        return null;
    }

    return <Outlet />;
}

export default LocaleLayout;
