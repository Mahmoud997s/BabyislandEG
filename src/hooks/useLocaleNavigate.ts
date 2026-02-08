"use client";

import { useRouter, useParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Hook for locale-aware navigation
 * Returns a navigate function that automatically adds locale prefix
 */
export function useLocaleNavigate() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();

    // Extract locale from pathname (Source of Truth)
    const pathnameLocale = pathname?.split('/')[1];
    const isValidLocale = pathnameLocale === 'en' || pathnameLocale === 'ar';
    const currentLocale = isValidLocale ? pathnameLocale : (params?.locale as string || 'ar');

    const localeNavigate = useCallback(
        (to: string | number, options?: { replace?: boolean; state?: any }) => {
            if (typeof to === 'number') {
                if (to === -1) {
                    router.back();
                }
                return;
            }

            // Don't add locale prefix to admin or api routes
            if (to.startsWith('/admin') || to.startsWith('/api')) {
                if (options?.replace) {
                    router.replace(to);
                } else {
                    router.push(to);
                }
                return;
            }

            const localizedPath = `/${currentLocale}${to.startsWith('/') ? to : `/${to}`}`.replace(/\/\/$/, '/');
            if (options?.replace) {
                router.replace(localizedPath);
            } else {
                router.push(localizedPath);
            }
        },
        [router, currentLocale]
    );

    return localeNavigate;
}

export default useLocaleNavigate;
