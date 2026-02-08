
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SmartClassifier } from '@/services/classification/SmartClassifier';

export async function POST(request: Request) {
    // 1. Security Check
    const authHeader = request.headers.get('x-admin-key');
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey || authHeader !== adminKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Parse Parameters (limit, offset)
        const { limit = 50, offset = 0 } = await request.json();
        
        // 3. Init Supabase Admin Client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

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
