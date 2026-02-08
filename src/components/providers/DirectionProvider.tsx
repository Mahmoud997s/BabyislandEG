"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function DirectionProvider() {
    const pathname = usePathname();

    useEffect(() => {
        // Simple logic: if pathname starts with /en, it's LTR.
        // Otherwise it's RTL (Arabic default)
        // Adjust logic if you have more languages.
        const isEnglish = pathname.startsWith("/en") || pathname === "/en";
        const dir = isEnglish ? "ltr" : "rtl";
        const lang = isEnglish ? "en" : "ar";

        document.documentElement.dir = dir;
        document.documentElement.lang = lang;
    }, [pathname]);

    return null; // Logic only, no UI
}
