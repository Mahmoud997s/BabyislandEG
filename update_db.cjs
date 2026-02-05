
console.log("Starting update_db.cjs...");
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(__dirname, '.env');
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
console.log("Supabase Connection:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

const jsonPath = path.resolve(__dirname, 'public/data/products.json');
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log(`Loaded ${products.length} products to update.`);

async function updateProducts() {
    let successCount = 0;
    let failCount = 0;
    const batchSize = 25;
    let processed = 0;

    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        console.log(`Processing batch ${i} - ${i + batchSize}...`);

        const promises = batch.map(async (p) => {
            const name = p.name_en || p.name_ar || p.name || "Unknown Product";

            // We only update description to avoid overwriting other potential changes
            const { error } = await supabase
                .from('products')
                .update({ description: p.description_text })
                .eq('name', name);

            if (error) return { error };
            return { success: true };
        });

        const results = await Promise.all(promises);

        results.forEach(r => {
            if (r.error) {
                if (failCount === 0) console.error("First Error:", r.error);
                failCount++;
            } else {
                successCount++;
            }
        });

        processed += batch.length;
    }

    console.log(`Update Complete. Success: ${successCount}, Failed: ${failCount}`);
}

updateProducts().catch(err => {
    console.error("Fatal Error:", err);
});
