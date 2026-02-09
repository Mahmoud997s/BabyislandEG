import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Admin Route Protection
    const pathname = request.nextUrl.pathname;
    const isAdminArea = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

    if (isAdminArea) {
        // Allow login page
        if (pathname === "/admin/login") {
            return response;
        }

        // 1. Check Authentication
        if (!user) {
            // For API routes, return 401 instead of redirect
            if (pathname.startsWith("/api/admin")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }

        // 2. Check Authorization (Role = admin)
        // SECURITY: Use app_metadata.role (server-side only, cannot be modified by client)
        const appMetadataRole = user.app_metadata?.role;
        
        if (appMetadataRole === "admin") {
            return response;
        }

        // Fallback verification via DB (secondary check)
        try {
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role === "admin") {
                return response;
            }
        } catch (e) {
            console.error("Middleware profile lookup failed:", e);
        }

        // Not an admin -> reject
        if (pathname.startsWith("/api/admin")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
}

export const config = {
    // Apply to admin routes and API admin routes
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
