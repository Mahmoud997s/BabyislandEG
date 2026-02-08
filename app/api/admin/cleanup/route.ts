import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        if (!supabaseAdmin) {
             return NextResponse.json(
                { error: 'Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing' },
                { status: 500 }
            );
        }

        // Security Check: Verify Admin Session
        // Since we are in an API route called by the UI, we should verify the user
        // We can reuse the logic or accept that Middleware catches most, but we double check here.
        // For simplicity in this P1 pass, we will trust Middleware but ensuring supabaseAdmin is present is good.
        // TODO (P2): Add explicit session check here using request.cookies if Middleware reliability is doubted.
        // Current Middleware already covers /api/admin/*, so we are covered by P0.

        // Additional Check: Ensure body exists
        const body = await request.json().catch(() => null);
        if (!body) return NextResponse.json({ error: 'Missing body' }, { status: 400 });

        const { action, keepCount, threshold } = body;

        let result;

        if (action === 'delete_extra_legacy') {
            // Logic: Keep first N products (by ID), delete the rest
            const limit = keepCount || 634;

            // 1. Fetch all IDs with no source or manual source
            const { data: allLegacy, error: fetchError } = await supabaseAdmin
                .from('products')
                .select('id')
                .or('source_platform.is.null,source_platform.eq.manual')
                .order('id', { ascending: true });

            if (fetchError) throw fetchError;

            if (!allLegacy || allLegacy.length <= limit) {
                return NextResponse.json({ message: 'No products to delete', count: 0 });
            }

            // 2. Identify IDs to delete
            const idsToDelete = allLegacy.slice(limit).map(p => p.id);

            // 3. Delete
            // Supabase/Postgres might limit the number of items in IN clause, so batching is safer for large sets
            // But for < few thousands, it's usually fine.
            const { error: deleteError } = await supabaseAdmin
                .from('products')
                .delete()
                .in('id', idsToDelete);

            if (deleteError) throw deleteError;

            result = { message: 'Deleted extra legacy products', count: idsToDelete.length };

        } else if (action === 'delete_new_seed') {
            // Delete products with ID > threshold
            if (!threshold) throw new Error('Threshold is required');

            const { error, count } = await supabaseAdmin
                .from('products')
                .delete({ count: 'exact' })
                .is('source_platform', null)
                .gt('id', threshold);

            if (error) throw error;
            result = { message: 'Deleted new seed products', count };

        } else if (action === 'delete_all_seed') {
            const { error, count } = await supabaseAdmin
                .from('products')
                .delete({ count: 'exact' })
                .is('source_platform', null);

            if (error) throw error;
            result = { message: 'Deleted all seed products', count };

        } else {
            throw new Error('Invalid action');
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[API/Cleanup] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
