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
    if (request.nextUrl.pathname.startsWith("/admin")) {
        // Allow login page
        if (request.nextUrl.pathname === "/admin/login") {
            return response;
        }

        // 1. Check Authentication
        if (!user) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }

        // 2. Check Authorization (Role = admin)
        // We prioritize metadata for speed and reliability, and check the profile as a secondary verification.
        const metadataRole = user.user_metadata?.role;
        
        if (metadataRole === "admin") {
            return response;
        }

        // Fallback/Secondary verification via DB
        try {
            const { data: profile, error: profileError } = await supabase
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

        // Not an admin in metadata OR DB -> redirect to home
        return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
}

export const config = {
    // Apply to admin routes and API admin routes
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
