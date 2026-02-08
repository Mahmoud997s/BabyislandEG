"use client";

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { forwardRef, ComponentPropsWithoutRef } from 'react';

type LocaleLinkProps = ComponentPropsWithoutRef<typeof Link> & {
    to?: string;
};

/**
 * Locale-aware Link component
 * Automatically prefixes paths with the current locale
 * EXCEPT for /admin and /api routes which remain non-localized
 */
export const LocaleLink = forwardRef<HTMLAnchorElement, LocaleLinkProps>(
    ({ to, href, ...props }, ref) => {
        const params = useParams();
        const pathname = usePathname();

        // Extract locale from pathname (Source of Truth) because params might be empty in some contexts
        const pathnameLocale = pathname?.split('/')[1]; // e.g., "", "en", "shop" -> "en" if valid
        const isValidLocale = pathnameLocale === 'en' || pathnameLocale === 'ar';

        const currentLocale = isValidLocale ? pathnameLocale : (params?.locale as string || 'ar');

        // Support both 'to' (React Router style) and 'href' (Next.js style)
        const path = to || (typeof href === 'string' ? href : href?.pathname) || '/';

        // Don't add locale prefix to admin, api, or external routes
        const shouldSkipLocale = path.startsWith('/admin') || path.startsWith('/api') || path.startsWith('http');

        if (shouldSkipLocale) {
            return <Link ref={ref} href={path} {...props} />;
        }

        // Convert to string and add locale prefix
        const localizedHref = `/${currentLocale}${path.startsWith('/') ? path : `/${path}`}`.replace(/\/\/$/, '/');

        return <Link ref={ref} href={localizedHref} {...props} />;
    }
);

LocaleLink.displayName = 'LocaleLink';

export default LocaleLink;

