import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/auth-server";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        await requireAdmin();
        const supabaseAdmin = getSupabaseAdmin();

        const body = await request.json();
        const { action } = body;
        let result;

        // Action 1: Delete extra legacy products (keep first N)
        if (action === 'delete_extra_legacy') {
            const keepCount = body.keepCount || 634;
            
            result = await supabaseAdmin
                .from('products')
                .delete({ count: 'exact' })
                .or('source_platform.is.null,source_platform.eq.manual')
                .gt('id', keepCount);
        } 
        // Action 2: Delete seeded products above a threshold
        else if (action === 'delete_new_seed') {
            const threshold = body.threshold || 1000;

            result = await supabaseAdmin
                .from('products')
                .delete({ count: 'exact' })
                .is('source_platform', null)
                .gt('id', threshold);
        } 
        else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        if (result.error) throw result.error;

        return NextResponse.json({
            success: true,
            message: "Cleanup successful",
            count: result.count || 0
        });

    } catch (error: any) {
        // Build-time safety net for catch block
        if (process.env.IS_BUILD === 'true' || request.cookies.getAll().length === 0) return NextResponse.json({});
        
        console.error("[API/Admin/Cleanup] Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" }, 
            { status: 500 }
        );
    }
}
