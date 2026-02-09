import "server-only";
import { validateSupabaseEnv } from "@/lib/supabase/env-validator";
import { createClient } from '@supabase/supabase-js';

// Access the Service Role Key securely from environment variables
// This key bypasses Row Level Security (RLS) policies
export function getSupabaseAdmin() {
    const { url: supabaseUrl, key: supabaseServiceRoleKey } = validateSupabaseEnv({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
        key: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
        label: 'SUPABASE_ADMIN'
    });

    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

