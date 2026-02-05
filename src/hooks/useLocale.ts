import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Hook to get current locale and build locale-aware paths
 */
export function useLocale() {
    const { locale } = useParams<{ locale: string }>();
    const { i18n } = useTranslation();

    const currentLocale = locale || i18n.language || 'ar';

    /**
     * Build a locale-aware path
     * @param path - The path without locale prefix (e.g., "/shop")
     * @returns The full path with locale prefix (e.g., "/ar/shop")
     */
    const localePath = (path: string): string => {
        // Remove leading slash if present and add locale prefix
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `/${currentLocale}${cleanPath === '/' ? '' : cleanPath}`;
    };

    return {
        locale: currentLocale,
        isRTL: currentLocale === 'ar',
        localePath,
    };
}

export default useLocale;
