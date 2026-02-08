
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
    envVars['SUPABASE_SERVICE_ROLE_KEY'],
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function fetchWithRetry(url: string, retries = 3) {
    console.log(`Fetching: ${url}`);
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); 
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            });
            clearTimeout(timeoutId);
            if (response.ok) return await response.text();
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
        // patterns
        const patterns = [
            /data-old-hires="([^"]+)"/,
            /data-a-dynamic-image="([^"]+)"/,
            /"large":"([^"]+)"/
        ];
        for (const pattern of patterns) {
            const match = html && html.match(pattern);
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
        // fallback
        if (html && html.includes('images.unsplash.com')) return null; // avoid generic if possible?
        return null;
    } catch (e: any) {
        return null;
    }
}

async function run() {
    console.log('Fetching products with source_url...');
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, images, product_sync_config!inner(source_url)')
        .not('product_sync_config.source_url', 'is', null);

    if (error) { console.error(error); return; }
    
    // Filter for NULL, empty, OR Unsplash placeholder
    const missingImages = products.filter(p => {
        if (!p.images || p.images.length === 0) return true;
        const firstImg = p.images[0];
        return !firstImg || firstImg.includes('unsplash.com');
    });
    
    console.log(`Found ${missingImages.length} products with Unsplash/Missing images to restore.`);

    let updatedCount = 0;
    for (const p of missingImages) {
        // Handle joined config
        const config = Array.isArray(p.product_sync_config) ? p.product_sync_config[0] : p.product_sync_config;
        if (!config || !config.source_url) continue;

        console.log(`Processing: ${p.id} - ${p.name.substring(0,20)}...`);
        const imageUrl = await scrapeImage(config.source_url);
        if (imageUrl && !imageUrl.includes('unsplash.com')) {
            console.log(`  Found: ${imageUrl.substring(0, 50)}...`);
            await supabase.from('products').update({ 
                images: [imageUrl] 
            }).eq('id', p.id);
            updatedCount++;
        } else {
            console.log(`  No image found (or still Unsplash).`);
        }
        await new Promise(r => setTimeout(r, 2000)); // 2s delay to be safe
    }
    console.log(`Done! Restored ${updatedCount} images.`);
}

run();
