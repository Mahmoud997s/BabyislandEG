
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SmartClassifier } from './src/services/classification/SmartClassifier';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) envVars[key.trim()] = value.trim();
});

const supabase = createClient(
    envVars['NEXT_PUBLIC_SUPABASE_URL'], 
    envVars['SUPABASE_SERVICE_ROLE_KEY'],
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
    console.log('Fetching all products...');
    const { data: products, error } = await supabase
        .from('products')
        .select('*, product_sync_config(source_url)');
        
    if (error || !products) { console.error(error); return; }

    console.log(`Analyzing ${products.length} products...`);
    const openAiKey = envVars['OPENAI_API_KEY'];
    
    // Batch process to avoid hitting rate limits too hard if using Vision
    let updates = 0;
    
    for (const p of products) {
        // Extract images
        // Supabase storage URLs or external URLs
        const imageUrls = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
        
        // Handle joined config
        // @ts-ignore
        const config = Array.isArray(p.product_sync_config) ? p.product_sync_config[0] : p.product_sync_config;
        const sourceUrl = config ? config.source_url : '';

        // Use the shared SmartClassifier with Vision capability
        const result = await SmartClassifier.classifyWithVision({
            name: p.name || '',
            name_ar: p.name_ar || '',
            description: p.description || '',
            breadcrumbs: [], 
            url: sourceUrl || '',
            imageUrls: imageUrls
        }, openAiKey);
        
        const newCat = result.category_id;
        
        // Log deep analysis
        if (result.confidence >= 5 && newCat !== 'uncategorized') {
             const { error: updateError } = await supabase.from('products').update({
                 category_ids: ['kafh-almntjat', newCat],
                 category: newCat 
             }).eq('id', p.id);
             
             if (!updateError) {
                process.stdout.write('.');
                updates++;
             }
        }
    }
    console.log(`\nUpdated ${updates} products.`);
}

run();
