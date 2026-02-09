
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Initialize Supabase Client inside handler to avoid build-time errors
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Build-time protection: Double Guard
        if (process.env.IS_BUILD === 'true' || request.cookies.getAll().length === 0) {
             return NextResponse.json({});
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        // 1. Debounce check via Cookie
        // Format: "123,456,789" (list of viewed IDs in this session/hour)
        const cookieStore = await cookies();
        const viewedCookie = cookieStore.get('viewed_products_session');
        const viewedIds = viewedCookie ? viewedCookie.value.split(',') : [];

        if (viewedIds.includes(String(productId))) {
            return NextResponse.json({ message: 'Already viewed', count: 0 });
        }

        // 2. Increment View Count in DB
        // Using RPC to be atomic and safe
        const { error } = await supabase.rpc('increment_view', { p_id: productId });

        if (error) {
            console.error('[Analytics] View increment error:', error);
            // Don't fail the request, just log it. 
            // It might fail if column doesn't exist yet (User didn't run SQL).
        }

        // 3. Update Cookie
        // Keep last 20 viewed items to avoid cookie overflow
        const newIds = [String(productId), ...viewedIds].slice(0, 20);
        
        const response = NextResponse.json({ message: 'View tracked', count: 1 });
        response.cookies.set('viewed_products_session', newIds.join(','), {
            maxAge: 3600, // 1 hour debounce
            path: '/',
        });

        return response;

    } catch (e) {
        console.error('[Analytics] Error:', e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
