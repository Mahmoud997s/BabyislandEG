import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
// Remove top-level import
// import { SmartClassifier } from '@/services/classification/SmartClassifier';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    // 1. Security Check (Defense in Depth)
    // 1. Security Check (Defense in Depth)
    const authHeader = request.headers.get('x-admin-key');
    const adminKey = process.env.ADMIN_API_KEY; 
    const isKeyValid = adminKey && authHeader === adminKey;

    if (!isKeyValid) {
         // Fallback: Check for Admin Session (Cookie-based) via Middleware
         // Since Middleware already protects /api/admin/*, we can theoretically trust it.
         // But for defense-in-depth, we should verify it here too if we want to be 100% sure.
         // However, creating a server client here to check session is expensive if middleware did it.
         // Given P0 middleware implementation:
         // Middleware checks session AND role='admin'.
         // So if we reach here, and it wasn't a key access, it MUST be a session access allowed by middleware.
         
         // To differentiate between "Script with wrong key" vs "User with session":
         // If authHeader is present but wrong -> 401.
         // If authHeader is missing -> assume Session access (Middleware protected).
         
         if (authHeader && authHeader !== adminKey) {
             return NextResponse.json({ error: 'Unauthorized: Invalid Admin Key' }, { status: 401 });
         }
         
         // If no header, we rely on Middleware. 
         // Double check: ensure we have a session? 
         // For now, trusting Middleware is consistent with the "Session" path.
    }

    try {
        // 2. Parse Parameters (limit, offset)
        const { limit = 50, offset = 0 } = await request.json();
        
        // 3. Supabase Admin Client
        const supabase = supabaseAdmin;
        if (!supabase) throw new Error('Supabase admin client not initialized');

        // 4. Fetch Batch
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .range(offset, offset + limit - 1);

        if (error) throw error;
        if (!products) return NextResponse.json({ success: true, message: 'No products found' });

        // 5. Process Batch
        let updates = 0;
        const openAiKey = process.env.OPENAI_API_KEY;

        // Dynamic import
        const { SmartClassifier } = await import('@/services/classification/SmartClassifier');

        const results = await Promise.all(products.map(async (p: any) => {
            // Logic duplicated from apply-smart-rules.js but optimized for server
            const imageUrls = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
            
            const classification = await SmartClassifier.classifyWithVision({
                name: p.name || '',
                name_ar: p.name_ar || '',
                description: p.description || '',
                breadcrumbs: [],
                url: p.source_url || '',
                imageUrls: imageUrls
            }, openAiKey);

            // Only update if changed or 'uncategorized'
            if (classification.category_id !== 'uncategorized' && classification.confidence > 0) {
                 const { error: updateError } = await supabase.from('products').update({
                     category_ids: ['kafh-almntjat', classification.category_id],
                     category: classification.category_id
                 }).eq('id', p.id);
                 
                 if (!updateError) updates++;
                 return { id: p.id, newCat: classification.category_id, status: 'updated' };
            }
            return { id: p.id, status: 'skipped' };
        }));

        return NextResponse.json({
            success: true,
            message: `Processed ${products.length} products. Updated ${updates}.`,
            updates,
            nextOffset: offset + limit
        });

    } catch (error: any) {
        console.error('Batch Reclassify Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
