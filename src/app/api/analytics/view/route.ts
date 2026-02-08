
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Initialize Supabase Client (Admin/Service Role not needed for public RPC usually, 
// but good to use standard client)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
    try {
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
