
import { NextResponse } from 'next/server';
import { SmartClassifier } from '@/services/classification/SmartClassifier';
import { ProductInput } from '@/services/classification/SmartClassifier';

export async function POST(request: Request) {
    // 1. Security Check (API Key)
    const authHeader = request.headers.get('x-admin-key');
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey || authHeader !== adminKey) {
        return NextResponse.json(
            { error: 'Unauthorized: Invalid or missing API Key' },
            { status: 401 }
        );
    }

    try {
        // 2. Parse Body
        const body = await request.json();
        const { product } = body;

        if (!product || !product.name) {
             return NextResponse.json(
                { error: 'Invalid payload: Product name is required' },
                { status: 400 }
            );
        }

        // 3. Run Classification (with Vision fallback)
        // Note: The API Route runs on the server, so it has access to process.env.OPENAI_API_KEY
        const openAiKey = process.env.OPENAI_API_KEY;
        
        // Ensure product matches ProductInput interface
        const productInput: ProductInput = {
            name: product.name,
            name_ar: product.name_ar,
            description: product.description,
            breadcrumbs: product.breadcrumbs || [],
            url: product.url || product.source_url,
            imageUrls: Array.isArray(product.images) ? product.images : (product.image ? [product.image] : [])
        };

        const result = await SmartClassifier.classifyWithVision(productInput, openAiKey);

        // 4. Return Result
        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error('Classification API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
