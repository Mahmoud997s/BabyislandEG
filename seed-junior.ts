
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SmartClassifier } from './src/services/classification/SmartClassifier';

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

const juniorUrls = [
"https://www.amazon.eg/-/en/Junior-Baby-Boys-Romper-Months/dp/B0DL33R77D",
"https://www.amazon.eg/-/en/Junior-Baby-Bodysuit-Multicolor-Months/dp/B0CRPS7WQK",
"https://www.amazon.eg/-/en/Junior-Baby-Boy-Socks-Months/dp/B0DVCF9T5Y",
"https://www.amazon.eg/-/en/Junior-Cotton-Baby-Bib-Months/dp/B0DVCG8RRK",
"https://www.amazon.eg/-/en/Junior-Baby-Romper-Patterned-Months/dp/B0DBVTCZ26",
"https://www.amazon.eg/-/en/Junior-Baby-cotton-bodysuits-Months/dp/B0DHSDPP2X",
"https://www.amazon.eg/-/en/Junior-BABY-SOCKS-Multicolor-Months/dp/B09RJ9CXML",
"https://www.amazon.eg/-/en/junior-Printed-Bib-P-2/dp/B0F441473T",
"https://www.amazon.eg/-/en/Junior-Bib-Baby-Girls-Multicolor/dp/B0FMQHM1JD",
"https://www.amazon.eg/-/en/Junior-Baby-Cotton-Bib-Months/dp/B0DVCGQZGW",
"https://www.amazon.eg/-/en/Junior-Infant-Comfortable-Sleeve-Romper/dp/B0DFCC6HVG",
"https://www.amazon.eg/-/en/Junior-Baby-cotton-bodysuits-Months/dp/B0DHSHRCFJ",
"https://www.amazon.eg/-/en/Junior-Baby-Boy-Cosmic-Bites/dp/B0DVGF732Z",
"https://www.amazon.eg/-/en/Junior-Baby-Romper-Cotton-Jumpsuit-Months/dp/B0F9Z232LM",
"https://www.amazon.eg/-/en/Junior-Short-Sleeve-Kimono-Bodysuit-Months/dp/B0DHSFK3KR",
"https://www.amazon.eg/-/en/Junior-Wearable-Baby-Vest-Months/dp/B0F442532W",
"https://www.amazon.eg/-/en/Junior-Baby-Patterned-Beige-Months/dp/B0DC3N96VZ",
"https://www.amazon.eg/-/en/Junior-Baby-cotton-bodysuits-Months/dp/B0DHSJGWBB",
"https://www.amazon.eg/-/en/Junior-Bodysuit-Baby-Unisex-Multicolour/dp/B0FM8PHXKW",
"https://www.amazon.eg/-/en/Junior-Dinosaur-Print-Socks-Months/dp/B0DVGLGDJ5",
"https://www.amazon.eg/-/en/Junior-Baby-2pcs-Printed-Months/dp/B0DGGF7Y8R",
"https://www.amazon.eg/-/en/Junior-Baby-Romper-Green-Months/dp/B0DBVRJZMP",
"https://www.amazon.eg/-/en/Junior-Baby-Boy-PRINTED-TEAL/dp/B0CXF248WN",
"https://www.amazon.eg/-/en/Junior-Romper-White-Peachy-Months/dp/B0DBVSCQCX",
"https://www.amazon.eg/-/en/Junior-Baby-Beanie-Set-Months/dp/B0DVCGFQ4L",
"https://www.amazon.eg/-/en/Junior-Baby-Printed-Blanket-Months/dp/B0DGGG3LF8",
"https://www.amazon.eg/-/en/Junior-Baby-Anti-Scratch-Mittens-Months/dp/B0DVCF4FZ9",
"https://www.amazon.eg/-/en/Junior-Romper-Baby-Boy-Olive/dp/B0FRN4ZFH6",
"https://www.amazon.eg/-/en/Junior-Romper-Baby-Boy-Olive/dp/B0FRN2R3B7",
"https://www.amazon.eg/-/en/Junior-Baby-Beanie-Set-Months/dp/B0DVGMX8JS",
"https://www.amazon.eg/-/en/Junior-Beanie-Patterned-Marble-Months/dp/B0DBVR7TQR",
"https://www.amazon.eg/-/en/Junior-Baby-Cotton-Beanie-Months/dp/B0DVCFZNTJ",
"https://www.amazon.eg/-/en/Junior-Baby-Stellar-Beanies-Months/dp/B0DVGRYZFL",
"https://www.amazon.eg/-/en/Junior-Blanket-Dreams-Decorative-Pattern/dp/B0FG3CQRHY",
"https://www.amazon.eg/-/en/Junior-Baby-Printed-Mittens-Months/dp/B0FHPB6MCT",
"https://www.amazon.eg/-/en/Junior-Baby-Striped-Blanket-Months/dp/B0DGGF8QDY",
"https://www.amazon.eg/-/en/Junior-Baby-Anti-Scratch-Mittens-Months/dp/B0DVH3RJ9G",
"https://www.amazon.eg/-/en/Junior-Baby-Printed-Hooded-Cotton-Blanket/dp/B0F43Y9WSK",
"https://www.amazon.eg/-/en/Junior-Mittens-Baby-Boy-Multicolour/dp/B0FRN1YTSV",
"https://www.amazon.eg/-/en/Junior-Baby-Romper-Yellow-Months/dp/B0DBVS5Q45",
"https://www.amazon.eg/-/en/Junior-Beanie-Yellow-Patterned-Months/dp/B0DBVRFHDH",
"https://www.amazon.eg/-/en/Junior-Blanket-Baby-Girl-Multicolour/dp/B0FS1X1RN2",
"https://www.amazon.eg/-/en/junior-3-2616-25-Junior-Hooded-Blanket/dp/B0DVCD3MPN",
"https://www.amazon.eg/-/en/Junior-Baby-Pants-Melon-Months/dp/B0CRPRT2LC",
"https://www.amazon.eg/-/en/Junior-Unisex-Hooded-Towel-Months/dp/B0CZJS7P14",
"https://www.amazon.eg/-/en/Junior-Unisex-Hooded-Cashmir-Months/dp/B0CZJS4GYD",
"https://www.amazon.eg/-/en/Junior-Unisex-Simon-Melon-Months/dp/B0CZJS6ZHQ",
"https://www.amazon.eg/-/en/Junior-Baby-Unisex-L-Blue-Months/dp/B0CZJS982D",
"https://www.amazon.eg/-/en/Junior-Baby-Unisex-Cashmir-Months/dp/B0CZJR8DZL",
"https://www.amazon.eg/-/en/Junior-Unisex-Hooded-Towel-Months/dp/B0CZJRNZNS",
"https://www.amazon.eg/-/en/Junior-Baby-Soft-Shoes-Months/dp/B0DVCFJN7S",
"https://www.amazon.eg/-/en/Junior-Baby-Steps-Shoes-Months/dp/B0DVGVKTNW",
"https://www.amazon.eg/-/en/Junior-Baby-Steps-Shoes-Months/dp/B0DVGDMJ83",
"https://www.amazon.eg/-/en/Junior-Baby-Girl-Shoes-Months/dp/B0DVCGKTN8",
"https://www.amazon.eg/-/en/Junior-Baby-Girl-Shoes-Months/dp/B0DVCF9KW8",
"https://www.amazon.eg/-/en/junior-Junior-Baby-Swaddle-2725607393130/dp/B099DZ4LDH",
"https://www.amazon.eg/-/en/junior-Junior-Baby-Swaddle/dp/B09238T8QG",
"https://www.amazon.eg/-/en/Junior-Baby-Boy-Wearable-Swaddle/dp/B0DVCFD4M2",
"https://www.amazon.eg/-/en/Junior-Swaddle-Patterned-Indego-Months/dp/B0DC3Q83W9",
"https://www.amazon.eg/-/en/Junior-Baby-Boy-Printed-Cotton-Swaddle-Blanket/dp/B0F441XC56",
"https://www.amazon.eg/-/en/Junior-Swaddle-Patterned-Beige-Months/dp/B0DC3PV14R",
"https://www.amazon.eg/-/en/Junior-Quality-Cotton-Printed-Swaddle/dp/B0CK797JN2",
"https://www.amazon.eg/-/en/Junior-Swaddle-Patterned-Peachy-Months/dp/B0DC3RQ5C4",
"https://www.amazon.eg/-/en/Junior-Baby-Swaddling-Blanket-Months/dp/B0DGGDD4MT",
"https://www.amazon.eg/-/en/Junior-Baby-Patterned-White-Months/dp/B0DC3G83HB",
"https://www.amazon.eg/-/en/Junior-Salmon-Patterned-Light-Months/dp/B0DC3QBJTG",
"https://www.amazon.eg/-/en/Junior-Baby-Girl-Bib-SIMON/dp/B0CXF19HDV",
"https://www.amazon.eg/-/en/Junior-Baby-Boy-PRINTED-MELANGE/dp/B0CXF1Z75P",
"https://www.amazon.eg/-/en/junior-Printed-Bib-P-2/dp/B0F442PHZK",
"https://www.amazon.eg/-/en/junior-Printed-Bib-P-2/dp/B0F43YJF97",
"https://www.amazon.eg/-/en/junior-Printed-Bib-P-2/dp/B0F442YT54",
"https://www.amazon.eg/-/en/junior-1-1807-25-Printed-Blanket/dp/B0F443RS3W",
"https://www.amazon.eg/-/en/junior-1-1278-25-Printed-Blanket/dp/B0F43ZN58D",
"https://www.amazon.eg/-/en/Junior-Unisex-Printed-Blanket-Months/dp/B0DGGGTLGK",
"https://www.amazon.eg/-/en/Junior-Baby-Boy-Printed-Blanket-Months/dp/B0DGGF62ZJ",
"https://www.amazon.eg/-/en/Junior-Baby-Printed-Blanket-Months/dp/B0DGGH9T2C",
"https://www.amazon.eg/-/en/Junior-Baby-Printed-Blanket-Months/dp/B0F43Y6KKB",
"https://www.amazon.eg/-/en/Junior-Printed-Wearable-Blanket-Months/dp/B0DGGFWGQC",
"https://www.amazon.eg/-/en/Junior-Printed-Blanket-Turqouise-Months/dp/B0BCKQCMSY",
"https://www.amazon.eg/-/en/Junior-Beanie-Patterned-Marble-Months/dp/B0FHN88P5B",
"https://www.amazon.eg/-/en/Junior-Beanie-Salmon-Patterned-Orange/dp/B0FHNVJ5JF",
"https://www.amazon.eg/-/en/Junior-Beanie-Patterned-Beige-Months/dp/B0DBVQ68DM",
"https://www.amazon.eg/-/en/Junior-Baby-Beanie-Patterned-Months/dp/B0DBVT955S",
"https://www.amazon.eg/-/en/Junior-Beanie-Salmon-Patterned-Orange/dp/B0DBVR44XV",
"https://www.amazon.eg/-/en/Junior-Baby-Beanie-Patterned-Months/dp/B0DBVQZB2X",
"https://www.amazon.eg/-/en/Junior-Beanie-Patterned-White-Months/dp/B0FHP9RKWQ",
"https://www.amazon.eg/-/en/Junior-Booties-Patterned-Beige-Months/dp/B0FHPSV3SL",
"https://www.amazon.eg/-/en/Junior-Booties-Patterned-Indego-Months/dp/B0DC5DB7Y2",
"https://www.amazon.eg/-/en/Junior-Booties-Patterned-Beige-Months/dp/B0DC5C4NLB",
"https://www.amazon.eg/-/en/Junior-Booties-Patterned-Beige-Months/dp/B0DC5C8WM1",
"https://www.amazon.eg/-/en/Junior-Printed-Booties-Pistage-Months/dp/B0CG9PSH7T",
"https://www.amazon.eg/-/en/Junior-Booties-Yellow-Patterned-Months/dp/B0DC5CT2LS",
"https://www.amazon.eg/-/en/Junior-Baby-Booties-Patterned-Months/dp/B0DC5C483B",
"https://www.amazon.eg/-/en/Junior-Printed-Booties-White-Months/dp/B0CG9KJXNS",
"https://www.amazon.eg/-/en/Junior-Printed-Booties-white-Months/dp/B0CG9HNFLR",
"https://www.amazon.eg/-/en/Junior-Baby-Kimono-Multicolor-Months/dp/B0CRPRNVVB",
"https://www.amazon.eg/-/en/Junior-Baby-Kimono-Multicolor-Months/dp/B0CRPQKQXN",
"https://www.amazon.eg/-/en/Junior-Short-Sleeve-Kimono-Bodysuit-Months/dp/B0DHSJSBP7",
"https://www.amazon.eg/-/en/Junior-Short-Sleeve-Kimono-Bodysuit-Months/dp/B0DHSJ8XGN",
"https://www.amazon.eg/-/en/Junior-Short-Sleeve-Kimono-Bodysuit-Months/dp/B0DHSHPMGP"
];

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
    
    // Title
    const titleMatch = html.match(/<span[^>]*id="productTitle"[^>]*>([^<]+)</);
    const title = titleMatch ? titleMatch[1].trim() : "Junior Product";
    
    // Price
    let price = 0;
    const pricePatterns = [
        /<span[^>]*class="[^"]*a-price-whole[^"]*"[^>]*>([^<]+)</,
        /<span[^>]*id="priceblock_ourprice"[^>]*>([^<]+)</
    ];
    for (const p of pricePatterns) {
        const m = html.match(p);
        if (m) {
            price = parseFloat(m[1].replace(/,/g, ''));
            break;
        }
    }
    if(!price) price = 300;

    // Image
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
            } catch (e) {}
        }
    }
    if (!imageUrl) imageUrl = "https://images.unsplash.com/photo-1522771753037-633375b4dc17?q=80&w=2070&auto=format&fit=crop";

    return { title, price, imageUrl };
}

async function run() {
    console.log(`Starting to seed ${juniorUrls.length} Junior products...`);
    
    let processed = 0;
    const chunkSize = 5; // Process in chunks
    
    for (let i = 0; i < juniorUrls.length; i += chunkSize) {
        const chunk = juniorUrls.slice(i, i + chunkSize);
        console.log(`Processing chunk ${i/chunkSize + 1} of ${Math.ceil(juniorUrls.length/chunkSize)}...`);
        
        await Promise.all(chunk.map(async (url) => {
            const html = await fetchWithRetry(url);
            if (!html) {
                 console.error(`Failed to fetch content for ${url}`);
                 return;
            }
            const data = parseAmazonProduct(html);
            
            if (data) {
                // Classify
                const classification = SmartClassifier.classify({
                    name: data.title,
                    description: `Official Junior product. High quality baby wear & accessories.`,
                    url: url
                });

                // Prep core product data
                // Note: removed source_stock as it's not in schema. stock is there.
                // removed sync fields from here, they go to product_sync_config
                const productData = {
                    name: data.title,
                    price: data.price,
                    description: `Official Junior product. High quality baby wear & accessories.`,
                    category: classification.category_id, 
                    category_ids: ['kafh-almntjat', classification.category_id],
                    images: [data.imageUrl],
                    stock: 50,
                    isNew: true,
                    rating: 5,
                    reviews: 0,
                    brand: 'Junior'
                };

                // Insert Product
                const { data: inserted, error } = await supabase.from('products').insert(productData).select().single();
                
                if (error || !inserted) {
                    console.error(`Error inserting ${data.title.substring(0,20)}:`, error?.message);
                } else {
                    // Insert sync config
                    const { error: syncError } = await supabase.from('product_sync_config').insert({
                        product_id: inserted.id,
                        sync_enabled: true,
                        source_url: url,
                        last_synced_at: new Date().toISOString()
                    });
                    
                    if (syncError) {
                        console.error(`Error inserting sync config for ${inserted.id}:`, syncError.message);
                    } else {
                        console.log(`  Inserted: ${data.title.substring(0, 30)}...`);
                        processed++;
                    }
                }
            } else {
                console.error(`Failed to scrape ${url}`);
            }
        }));
        
        // Polite delay
        await new Promise(r => setTimeout(r, 2000));
    }
    
    console.log(`Done! Seeded ${processed} products.`);
}

run();
