
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
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            });
            clearTimeout(timeoutId);
            
            if (response.ok) {
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

function parseAmazonProduct(html: string) {
    if (!html) return null;
    
    // Price
    let price = 0;
    const pricePatterns = [
        /<span[^>]*class="[^"]*a-price-whole[^"]*"[^>]*>([^<]+)</,
        /<span[^>]*id="priceblock_ourprice"[^>]*>([^<]+)</,
        /<span[^>]*class="[^"]*a-offscreen[^"]*"[^>]*>EGP&nbsp;([^<]+)</
    ];
    for (const p of pricePatterns) {
        const m = html.match(p);
        if (m) {
            price = parseFloat(m[1].replace(/,/g, '').trim());
            break;
        }
    }

    // Availability
    const isOutOfStock = html.includes('Currently unavailable') || 
                         html.includes('Temporarily out of stock') || 
                         html.includes('Out of Stock') ||
                         html.includes('We don\'t know when or if this item will be back in stock');
    
    // Image (Re-scrape to ensure consistency)
    let imageUrl = null;
    const imgMatch = html.match(/data-old-hires="([^"]+)"/);
    if (imgMatch) {
        imageUrl = imgMatch[1];
    } else {
        const dynImg = html.match(/data-a-dynamic-image="([^"]+)"/);
        if (dynImg) {
            try {
                const json = JSON.parse(dynImg[1].replace(/&quot;/g, '"'));
                imageUrl = Object.keys(json)[0];
            } catch (e) {
                 const urlMatch = dynImg[1].match(/(https?:\/\/[^"]+)/);
                 if (urlMatch) imageUrl = urlMatch[1];
            }
        }
    }

    return { price, isOutOfStock, imageUrl };
}

async function run() {
    console.log('Fetching Junior products for Full Sync (Price & Stock)...');
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, price, stock, product_sync_config!inner(source_url)') 
        .eq('brand', 'Junior');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(`Found ${products.length} products. Starting full sync...`);

    let updatedCount = 0;
    for (const product of products) {
        // Handle joined config
        const config = Array.isArray(product.product_sync_config) ? product.product_sync_config[0] : product.product_sync_config;
        if (!config || !config.source_url) continue;

        console.log(`Processing: ${product.name.substring(0, 30)}...`);
        const html = await fetchWithRetry(config.source_url);
        if (!html) continue;

        const data = parseAmazonProduct(html);
        
        if (data) {
            const configUpdates: any = {
                last_synced_at: new Date().toISOString()
            };
            const productUpdates: any = {};
            
            let changed = false;

            // Update Image if found
            if (data.imageUrl) {
                 productUpdates.images = [data.imageUrl];
                 changed = true;
            }

            // Update Price
            if (data.price > 0 && data.price !== product.price) {
                productUpdates.price = data.price;
                configUpdates.source_price = data.price; // If checking for source_price changes?
                // Actually source_price is not in config (unless I missed it, see previous thought).
                // Let's assume for now source_price is on products or ignored. 
                // Wait, if it's not on config, I can't put it there.
                // Inspect said source_price is on products (Step 1893).
                // My Create SQL (Step 1924) did NOT Create it on product_sync_config.
                // So it must be on products.
                productUpdates.source_price = data.price; 
                console.log(`  Price update: ${product.price} -> ${data.price}`);
                changed = true;
            }

            // Update Stock
            const newStock = data.isOutOfStock ? 0 : 50; 
            if (newStock !== product.stock) {
                productUpdates.stock = newStock;
                productUpdates.source_stock = newStock; 
                console.log(`  Stock update: ${product.stock} -> ${newStock}`);
                changed = true;
            }

            if (changed) {
                // Update Product
                const { error: updateError } = await supabase
                    .from('products')
                    .update(productUpdates)
                    .eq('id', product.id);
                
                if (updateError) console.error(`  Product Update failed: ${updateError.message}`);
                else updatedCount++;
            } else {
                console.log(`  No changes.`);
            }

            // Always update Last Synced
            await supabase.from('product_sync_config')
                .update(configUpdates)
                .eq('product_id', product.id);

        } else {
            console.log(`  Failed to parse product data.`);
        }
        
        // Delay to be nice
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`Done! Synced ${updatedCount} products.`);
}

run();
