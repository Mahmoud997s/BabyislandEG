
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function fetchWithRetry(url: string, retries = 3) {
    console.log(`Fetching: ${url}`);
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
            
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            });
            clearTimeout(timeoutId);
            
            if (response.ok) {
                // console.log(`  Success: ${response.status}`);
                return await response.text();
            }
            throw new Error(`Status ${response.status}`);
        } catch (e: any) {
            console.log(`  Retry ${i+1}/${retries} error: ${e.message}`);
            await new Promise(r => setTimeout(r, 2000 * (i + 1)));
        }
    }
    return null;
}

async function scrapeImage(url: string) {
    try {
        const html = await fetchWithRetry(url);
        if (!html) return null;
        
        // Try regex patterns for Amazon images
        const patterns = [
            /data-old-hires="([^"]+)"/,
            /data-a-dynamic-image="([^"]+)"/,
            /"large":"([^"]+)"/
        ];

        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match && match[1]) {
                let imgUrl = match[1];
                if (imgUrl.startsWith('{')) {
                    try {
                        const json = JSON.parse(imgUrl.replace(/&quot;/g, '"'));
                        imgUrl = Object.keys(json)[0];
                    } catch (e) {
                         const urlMatch = imgUrl.match(/(https?:\/\/[^"]+)/);
                         if (urlMatch) imgUrl = urlMatch[1];
                    }
                }
                return imgUrl;
            }
        }
        return null;
    } catch (e: any) {
        console.error(`Error scraping ${url}:`, e.message);
        return null;
    }
}

async function run() {
    console.log('Fetching Junior products with source_url...');
    console.log('Fetching Junior products with source_url...');
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, product_sync_config!inner(source_url)')
        .eq('brand', 'Junior');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(`Found ${products.length} products. Starting image sync...`);

    let updatedCount = 0;
    for (const product of products) {
        // Handle joined config
        const config = Array.isArray(product.product_sync_config) ? product.product_sync_config[0] : product.product_sync_config;
        if (!config || !config.source_url) continue;

        console.log(`Processing: ${product.name.substring(0, 30)}...`);
        const imageUrl = await scrapeImage(config.source_url);
        
        if (imageUrl) {
            console.log(`  Found image: ${imageUrl.substring(0, 50)}...`);
            const { error: updateError } = await supabase
                .from('products')
                .update({ images: [imageUrl] })
                .eq('id', product.id);
            
            if (updateError) {
                console.error(`  Update failed: ${updateError.message}`);
            } else {
                console.log(`  Updated!`);
                updatedCount++;
            }
        } else {
            console.log(`  No image found.`);
        }
        
        // Delay to be nice
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`Done! Updated images for ${updatedCount} products.`);
}

run();
