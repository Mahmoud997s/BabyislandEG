import "server-only";
import { createClient } from '@supabase/supabase-js';

// Access the Service Role Key securely from environment variables
// This key bypasses Row Level Security (RLS) policies
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) || 'https://placeholder.supabase.co';
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) || 'placeholder-key';

export const supabaseAdmin = (supabaseUrl && supabaseServiceRoleKey)
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;

if (!supabaseServiceRoleKey) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. Admin operations will fail.');
}
