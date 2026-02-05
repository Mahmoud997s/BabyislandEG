
console.log("Starting serial update...");
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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const jsonPath = path.resolve(__dirname, 'public/data/products.json');
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

async function run() {
    let success = 0;
    let fail = 0;

    // Process first 200 items only for test/speed, or all? All.
    // Use for loop
    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const name = p.name_en || p.name_ar || p.name || "Unknown Product";

        try {
            const { error } = await supabase
                .from('products')
                .update({ description: p.description_text })
                .eq('name', name);

            if (error) {
                console.error(`Error on ${i}:`, error.message);
                fail++;
            } else {
                success++;
            }
        } catch (e) {
            console.error(`Exception on ${i}:`, e.message);
            fail++;
        }

        if (i % 50 === 0) console.log(`Processed ${i}/${products.length}...`);
    }

    console.log(`Done. Success: ${success}, Fail: ${fail}`);
}

run();
