/**
 * Bulk Sync API Route
 * POST: Sync multiple products
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncService } from '@/services/syncService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productIds, syncAll, forceUpdate } = body;

        if (syncAll) {
            // Sync all stale products
            const results = await syncService.syncStaleProducts();
            return NextResponse.json({
                message: 'Bulk sync completed',
                total: results.length,
                success: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length,
                results,
            });
        }

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return NextResponse.json(
                { error: 'productIds array is required' },
                { status: 400 }
            );
        }

        if (productIds.length > 50) {
            return NextResponse.json(
                { error: 'Maximum 50 products per bulk sync' },
                { status: 400 }
            );
        }

        const results = await syncService.syncBulk(productIds, { forceUpdate });

        return NextResponse.json({
            message: 'Bulk sync completed',
            total: results.length,
            success: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results,
        });

    } catch (error: any) {
        console.error('[API/Sync/Bulk] Error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
