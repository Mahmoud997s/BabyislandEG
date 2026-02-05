import { Link, LinkProps, useParams } from 'react-router-dom';
import { forwardRef } from 'react';

/**
 * Locale-aware Link component
 * Automatically prefixes paths with the current locale
 */
export const LocaleLink = forwardRef<HTMLAnchorElement, LinkProps>(
    ({ to, ...props }, ref) => {
        const { locale } = useParams<{ locale: string }>();
        const currentLocale = locale || localStorage.getItem('locale') || 'ar';

        // Convert to string and add locale prefix
        const localizedTo = typeof to === 'string'
            ? `/${currentLocale}${to.startsWith('/') ? to : `/${to}`}`.replace(/\/\/$/, '/')
            : to;

        return <Link ref={ref} to={localizedTo} {...props} />;
    }
);

LocaleLink.displayName = 'LocaleLink';

export default LocaleLink;
