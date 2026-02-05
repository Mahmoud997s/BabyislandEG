import { useNavigate, useParams } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Hook for locale-aware navigation
 * Returns a navigate function that automatically adds locale prefix
 */
export function useLocaleNavigate() {
    const navigate = useNavigate();
    const { locale } = useParams<{ locale: string }>();
    const currentLocale = locale || localStorage.getItem('locale') || 'ar';

    const localeNavigate = useCallback(
        (to: string | number, options?: { replace?: boolean; state?: any }) => {
            if (typeof to === 'number') {
                navigate(to);
                return;
            }

            // Don't add locale prefix to admin routes
            if (to.startsWith('/admin')) {
                navigate(to, options);
                return;
            }

            const localizedPath = `/${currentLocale}${to.startsWith('/') ? to : `/${to}`}`.replace(/\/\/$/, '/');
            navigate(localizedPath, options);
        },
        [navigate, currentLocale]
    );

    return localeNavigate;
}

export default useLocaleNavigate;
