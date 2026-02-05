
console.log("Starting clean.cjs...");
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log("Imports done.");

const envPath = path.resolve(__dirname, '.env');
console.log("Reading .env from", envPath);

const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

const jsonPath = path.resolve(__dirname, 'public/data/products.json');

async function cleanProducts() {
    console.log("Reading products.json...");
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    let products = JSON.parse(rawData);

    console.log(`Processing ${products.length} products...`);

    let cleanedCount = 0;

    const cleanedProducts = products.map(p => {
        let desc = p.description_text || "";
        const originalDesc = desc;

        const endMarkers = [
            "Your Dynamic Snippet will be displayed here...",
            "Get to know us",
            "Best Price Guarantee",
            "Social Media"
        ];

        for (const marker of endMarkers) {
            const idx = desc.indexOf(marker);
            if (idx !== -1) {
                desc = desc.substring(0, idx);
            }
        }

        desc = desc.replace(/(تواصل معنا\s*)+/g, "");
        desc = desc.replace(/Rate Us\s*$/i, "");

        const phrasesToRemove = [
            "أرسل لنا رسالة",
            "[email protected]",
            "+2 01062185805",
            "Terms & Conditions - Babyisland Stores Locations",
            "Return & Refund Policy",
            "الرئيسية",
            "من نحن",
            "•",
            "Rate Us"
        ];

        phrasesToRemove.forEach(phrase => {
            desc = desc.split(phrase).join("");
        });

        desc = desc.trim();

        if (desc !== originalDesc) {
            cleanedCount++;
        }

        return {
            ...p,
            description_text: desc
        };
    });

    console.log(`Cleaned descriptions for ${cleanedCount} products.`);

    console.log("Saving new_products.json...");
    fs.writeFileSync(jsonPath, JSON.stringify(cleanedProducts, null, 2));

    console.log("Updating Supabase...");
    let successCount = 0;
    let failCount = 0;
    const batchSize = 50;
    let processed = 0;

    for (let i = 0; i < cleanedProducts.length; i += batchSize) {
        const batch = cleanedProducts.slice(i, i + batchSize);

        const promises = batch.map(p => {
            const name = p.name_en || p.name_ar || p.name || "Unknown Product";
            return supabase
                .from('products')
                .update({ description: p.description_text })
                .eq('name', name)
                .then(({ error }) => {
                    if (error) return { error };
                    return { success: true };
                });
        });

        const results = await Promise.all(promises);
        results.forEach(r => {
            if (r.error) failCount++;
            else successCount++;
        });

        processed += batch.length;
        if (processed % 100 === 0) {
            console.log(`Processed ${processed}/${cleanedProducts.length}...`);
        }
    }

    console.log(`Update Complete. Success: ${successCount}, Failed: ${failCount}`);
}

cleanProducts().catch(err => {
    console.error(err);
    process.exit(1);
});
