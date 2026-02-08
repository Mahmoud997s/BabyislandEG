/**
 * Cron Sync API Route
 * Called by Vercel Cron to sync stale products automatically
 */

import { NextRequest, NextResponse } from 'next/server';
// Remove top-level import
// import { syncService } from '@/services/syncService';

// Vercel Cron protection - only allow requests from Vercel
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Verify cron secret (Security P0)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // If CRON_SECRET is set (Production), strict check. 
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized: Invalid Cron Secret' },
                { status: 401 }
            );
        }

        console.log('[Cron/Sync] Starting automatic sync...');

        // Dynamic import to avoid build-time static analysis issues with top-level side effects
        const { syncService } = await import('@/services/syncService');
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
