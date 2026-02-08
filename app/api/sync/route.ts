/**
 * Product Sync API Route
 * POST: Sync a single product
 * GET: Get sync status
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncService } from '@/services/syncService';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, forceUpdate, updatePrice, updateStock } = body;

        if (!productId) {
            return NextResponse.json(
                { error: 'productId is required' },
                { status: 400 }
            );
        }

        const result = await syncService.syncProduct(productId, {
            forceUpdate,
            updatePrice,
            updateStock,
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[API/Sync] Error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (productId) {
            // Get sync history for specific product
            const history = await syncService.getSyncHistory(productId);
            return NextResponse.json({ history });
        }

        // Get overall sync stats
        const stats = await syncService.getSyncStats();
        return NextResponse.json(stats);

    } catch (error: any) {
        console.error('[API/Sync] Error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
