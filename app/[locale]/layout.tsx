"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { changeLocale, SUPPORTED_LOCALES, type Locale } from "@/i18n";

export default function LocaleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const locale = params.locale as string;
    const { i18n } = useTranslation();
    const router = useRouter();

    useEffect(() => {
        // Strict: URL is King. 
        // If we are here, next.js matched [locale], so params.locale IS defined.

        if (!locale || !SUPPORTED_LOCALES.includes(locale as Locale)) {
            // Should be handled by middleware, but fallback:
            router.replace("/ar");
            return;
        }

        // Sync i18n instance to URL locale (client-side only)
        if (i18n.language !== locale) {
            changeLocale(locale as Locale);
        }

        // Sync localStorage (for persistence across sessions)
        if (typeof window !== "undefined") {
            if (localStorage.getItem("locale") !== locale) {
                localStorage.setItem("locale", locale);
            }
        }

        // NOTE: Document direction is now set by root layout SSR.
        // Do NOT manipulate document.dir here to avoid hydration mismatch.
    }, [locale, i18n, router]);

    // Don't render until we have a valid locale
    if (!locale || !SUPPORTED_LOCALES.includes(locale as Locale)) {
        return null;
    }

    // Just pass through children
    return <>{children}</>;
}
