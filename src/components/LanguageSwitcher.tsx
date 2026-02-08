"use client";

import { useRouter, useParams, usePathname, useSearchParams } from "next/navigation";
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { locale } = useParams<{ locale: string }>();

    const currentLocale = locale || i18n.language || 'ar';
    const targetLocale = currentLocale === 'ar' ? 'en' : 'ar';

    const handleSwitch = () => {
        // Replace locale in current path
        const pathWithoutLocale = pathname.replace(/^\/(ar|en)/, '');
        const searchString = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const newPath = `/${targetLocale}${pathWithoutLocale || '/'}${searchString}`;

        // Save preference logic REMOVED to respect "URL IS KING"
        // Only sync happens in layout.tsx based on URL.
        // We do NOT manually set localStorage here before navigation.
        // Just navigate.

        // Navigate
        router.push(newPath);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleSwitch}
            className="gap-1 px-2"
            title={currentLocale === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
        >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-medium">
                {currentLocale === 'ar' ? 'EN' : 'ع'}
            </span>
        </Button>
    );
}

export default LanguageSwitcher;
