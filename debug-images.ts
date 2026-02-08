
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    envVars['SUPABASE_SERVICE_ROLE_KEY']
);

async function checkImages() {
    // 1. Count products with source_url (via sync config)
    const { count: sourceCount } = await supabase
        .from('product_sync_config')
        .select('*', { count: 'exact', head: true })
        .not('source_url', 'is', null);
    
    console.log(`Products with source_url: ${sourceCount}`);

    // 2. Sample products with source_url to see images
    const { data: products } = await supabase
        .from('products')
        .select('id, name, images, product_sync_config!inner(source_url)')
        .limit(5);

    if (!products) {
        console.log("No products found.");
        return;
    }

    products.forEach((p: any) => {
        console.log(`\n📦 ${p.name}`);
        console.log(`   - Main Image: ${p.images ? p.images[0] : 'N/A'}`);
        console.log(`   - Images Array Len: ${p.images ? p.images.length : 0}`);
        
        const config = Array.isArray(p.product_sync_config) ? p.product_sync_config[0] : p.product_sync_config;
        console.log(`   - Source URL: ${config ? config.source_url : 'N/A'}`);
    });
}

checkImages();
