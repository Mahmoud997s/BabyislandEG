
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

// Type definitions
interface Product {
    id: number;
    name: string;
}
interface AnalyticsUpdate {
    product_id: number;
    views_count: number;
    sales_count: number;
    last_sale_at: string | null;
}

const supabase = createClient(
    envVars['NEXT_PUBLIC_SUPABASE_URL'], 
    envVars['SUPABASE_SERVICE_ROLE_KEY']
);

async function seed() {
    console.log("🌱 Seeding Mock Analytics Data (Pareto Principle)...");
    
    // 1. Get all products
    const { data: products } = await supabase.from('products').select('id, name');
    if (!products) return;

    console.log(`Processing ${products.length} products...`);

    // 2. Distribute Traffic
    // Top 20% get 80% of traffic
    const topCount = Math.floor(products.length * 0.2);
    
    let updated = 0;
    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const isTop = i < topCount;
        
        // Mock Views
        const views = isTop 
            ? Math.floor(Math.random() * 500) + 100 // 100-600 views
            : Math.floor(Math.random() * 50);       // 0-50 views

        // Mock Sales (Conversion ~2-5%)
        const sales = isTop
            ? Math.floor(views * (0.02 + Math.random() * 0.03)) 
            : 0;

        // Mock Last Sale Date (if sales > 0)
        let lastSale = null;
        if (sales > 0) {
            const daysAgo = Math.floor(Math.random() * 10);
            const d = new Date();
            d.setDate(d.getDate() - daysAgo);
            lastSale = d.toISOString();
        }

        const { error } = await supabase.from('product_analytics').upsert({
            product_id: p.id,
            views_count: views,
            sales_count: sales,
            last_sale_at: lastSale
        }, { onConflict: 'product_id' });

        if (!error) updated++;
        if (i % 50 === 0) process.stdout.write('.');
    }

    console.log(`\n✅ Seeded analytics for ${updated} products.`);
}

seed();
