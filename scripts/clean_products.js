
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// Load env vars manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

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

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const jsonPath = path.resolve(__dirname, '../public/data/products.json');

async function cleanProducts() {
    console.log("Reading products.json...");
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    let products = JSON.parse(rawData);

    console.log(`Processing ${products.length} products...`);

    let cleanedCount = 0;

    const cleanedProducts = products.map(p => {
        let desc = p.description_text || "";
        const originalDesc = desc;

        // 1. Remove "Your Dynamic Snippet..." and everything after (End Garbage)
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

        // 2. Remove "تواصل معنا" chunks and newlines at start/middle/end
        // We replace "تواصل معنا" and surrounding whitespace
        // Also specific patterns like "تواصل معنا" followed by newlines
        desc = desc.replace(/(تواصل معنا\s*)+/g, "");

        // 3. Remove "Rate Us" if it persists at the end
        desc = desc.replace(/Rate Us\s*$/i, "");

        // 4. Remove other specific phrases
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
            // Escape special chars for regex or use replaceAll
            desc = desc.split(phrase).join("");
        });

        // 5. Trim
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

    console.log("Saving cleaned products.json...");
    fs.writeFileSync(jsonPath, JSON.stringify(cleanedProducts, null, 2));

    console.log("Updating Supabase...");
    let successCount = 0;
    let failCount = 0;

    // We will update in batches
    const batchSize = 25;
    let processed = 0;

    // We need to loop.
    // Since we don't have IDs, matching by name is the only way.
    // The migration used: name = p.name_en || p.name_ar || p.name

    // We will create an array of updates to run sequentially or parallel chunks.

    for (let i = 0; i < cleanedProducts.length; i += batchSize) {
        const batch = cleanedProducts.slice(i, i + batchSize);
        const promises = batch.map(p => {
            const name = p.name_en || p.name_ar || p.name || "Unknown Product";
            const newDescription = p.description_text;

            return supabase
                .from('products')
                .update({ description: newDescription })
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
