/**
 * Validates Supabase environment variables to prevent build-time crashes
 * and ensure runtime security.
 */
export function validateSupabaseEnv({ 
    url, 
    key, 
    label 
}: { 
    url: string | undefined; 
    key: string | undefined; 
    label: string; 
}) {
    // 1. Check URL
    if (!url || !url.startsWith('http')) {
        throw new Error(
            `[${label}] Invalid or missing Supabase URL. Value: '${url}'. ` +
            `Ensure NEXT_PUBLIC_SUPABASE_URL is set in .env.local`
        );
    }

    // 2. Check Key
    if (!key || key.length < 10) {
        throw new Error(
            `[${label}] Invalid or missing Supabase Key. ` +
            `Ensure the appropriate key (ANON or SERVICE_ROLE) is set.`
        );
    }

    return { url, key };
}
