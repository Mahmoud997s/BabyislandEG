import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================================================
// Constants
// ============================================================================

const SUPPORTED_LOCALES = ["ar", "en"] as const;
const DEFAULT_LOCALE = "ar";

type Locale = (typeof SUPPORTED_LOCALES)[number];

// ============================================================================
// Helpers
// ============================================================================

/**
 * Extract locale from pathname if present
 * @returns Locale if valid, null if missing/invalid
 */
function getLocaleFromPathname(pathname: string): Locale | null {
    const segments = pathname.split("/");
    const potentialLocale = segments[1];

    if (SUPPORTED_LOCALES.includes(potentialLocale as Locale)) {
        return potentialLocale as Locale;
    }
    return null;
}

/**
 * Check if path should bypass middleware
 */
function shouldBypassMiddleware(pathname: string): boolean {
    return (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/admin") ||
        pathname.includes(".")
    );
}

// ============================================================================
// Middleware
// ============================================================================

export function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // 1. Bypass internal/static/admin paths
    if (shouldBypassMiddleware(pathname)) {
        return NextResponse.next();
    }

    // 2. Detect locale from URL
    const detectedLocale = getLocaleFromPathname(pathname);

    // 3. Valid locale path - add x-locale header for SSR
    if (detectedLocale) {
        const headers = new Headers(request.headers);
        headers.set("x-locale", detectedLocale);
        return NextResponse.next({ request: { headers } });
    }

    // 4. Root path - redirect to cookie preference or default
    if (pathname === "/") {
        const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
        const targetLocale = (localeCookie && SUPPORTED_LOCALES.includes(localeCookie as Locale))
            ? localeCookie
            : DEFAULT_LOCALE;

        return NextResponse.redirect(
            new URL(`/${targetLocale}${search}`, request.url)
        );
    }

    // 5. Missing locale - redirect with cookie preference or default
    const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
    const fallbackLocale = (localeCookie && SUPPORTED_LOCALES.includes(localeCookie as Locale))
        ? localeCookie
        : DEFAULT_LOCALE;

    return NextResponse.redirect(
        new URL(`/${fallbackLocale}${pathname}${search}`, request.url)
    );
}

// ============================================================================
// Config
// ============================================================================

export const config = {
    matcher: ["/((?!_next|.*\\..*).*)"],
};
