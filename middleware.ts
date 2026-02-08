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
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
        // We fetch the profile to check the role. 
        // Note: In a high-traffic app, you might want to cache this or use custom claims.
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") {
            // Logged in but not admin -> redirect to home or show error
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return response;
}

export const config = {
    // Apply to admin routes and API admin routes
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
