
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) envVars[key.trim()] = value.trim();
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
    // 1. Load Data
    const jsonPath = path.join(__dirname, 'public/data/products.unique.json');
    if (!fs.existsSync(jsonPath)) {
        console.error('products.unique.json not found!');
        return;
    }
    const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`Loaded ${products.length} unique products from JSON.`);

    // 2. Clear Database
    // Using a broad filter to delete all. Assuming 'id' > 0 works for numeric IDs.
    // If IDs are UUIDs, this might fail, we'll try .neq('slug', 'non-existent-slug') to match all?
    // Actually .neq('id', 0) is safer if numeric.
    console.log('Clearing existing products...');
    const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .neq('id', 0); // Hack to delete all

    if (deleteError) {
        console.error('Error clearing DB:', deleteError);
        // Fallback: Try checking if id is UUID?
        // If error implies UUID, we might need a different approach.
        return;
    }
    console.log('Database cleared.');

    // 3. Insert in Chunks
    const CHUNK_SIZE = 50;
    let insertedCount = 0;

    for (let i = 0; i < products.length; i += CHUNK_SIZE) {
        const chunk = products.slice(i, i + CHUNK_SIZE);
        
        // Map and Sanitize
        const cleanChunk = chunk.map((p: any) => {
             // Map fields from JSON (Scraped structure) to DB (App structure)
             return {
                name: p.name_en || p.name || p.name_ar || 'Unknown Product',
                name_ar: p.name_ar,
                // slug: p.slug, // Removed as column missing
                price: p.price,
                images: p.images || [],
                description: p.description_text || p.description || '',
                category_ids: p.category_ids || [],
                // Fallback for singular category column if exists
                category: (p.category_ids && p.category_ids.length > 1) ? p.category_ids[1] : 'uncategorized',
                rating: Number(p.rating) || 5, // Singular 'rating'
                reviews: Number(p.reviews) || 0,
                stock: p.stock_status === 'out_of_stock' ? 0 : 10,
                // specs: p.specs || {}, // Removed as column missing
                // product_id: p.product_id, // Removed as column missing
                // Remove derived/frontend fields
                // breadcrumbs, url_ar, url_en, etc are dropped
             };
        });

        const { error: insertError } = await supabase
            .from('products')
            .insert(cleanChunk);

        if (insertError) {
            console.error(`Error inserting chunk ${i}:`, insertError);
            // If error is about missing column, we might need to drop more.
            // But 'name', 'slug', 'price' are standard.
        } else {
            insertedCount += cleanChunk.length;
            process.stdout.write(`\rInserted ${insertedCount}/${products.length}...`);
        }
    }

    console.log(`\n✅ seeding complete. Inserted ${insertedCount} products.`);
}

run();
