/**
 * Cron Sync API Route
 * Called by Vercel Cron to sync stale products automatically
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncService } from '@/services/syncService';

// Vercel Cron protection - only allow requests from Vercel
export async function GET(request: NextRequest) {
    try {
        // Verify cron secret (optional security measure)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('[Cron/Sync] Starting automatic sync...');

        const results = await syncService.syncStaleProducts();

        const summary = {
            timestamp: new Date().toISOString(),
            total: results.length,
            success: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            priceUpdates: results.filter(r => r.priceUpdated).length,
            stockUpdates: results.filter(r => r.stockUpdated).length,
        };

        console.log('[Cron/Sync] Completed:', summary);

        return NextResponse.json(summary);

    } catch (error: any) {
        console.error('[Cron/Sync] Error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
