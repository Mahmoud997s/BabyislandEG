import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only admin client with Service Role Key.
 * BYPASSES RLS. Use with caution.
 * Only import in Server Components, Server Actions, or Route Handlers.
 */
export const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("Missing Supabase Admin environment variables.");
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
};
