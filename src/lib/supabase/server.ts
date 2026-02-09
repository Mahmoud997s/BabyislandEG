import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { validateSupabaseEnv } from "@/lib/supabase/env-validator";

/**
 * Create a Supabase client for Server Components/Actions.
 * Uses cookies to maintain user session.
 */
export async function createClient() {
    const cookieStore = await cookies();

    const { url: supabaseUrl, key: supabaseAnonKey } = validateSupabaseEnv({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        label: 'SUPABASE_SERVER_CLIENT'
    });

    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}
