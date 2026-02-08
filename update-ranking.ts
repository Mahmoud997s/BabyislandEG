
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

// Types
interface ProductAnalytics {
    product_id: number;
    views_count: number;
    sales_count: number;
    last_sale_at: string | null;
    ranking_score?: number;
}

const supabase = createClient(
    envVars['NEXT_PUBLIC_SUPABASE_URL'], 
    envVars['SUPABASE_SERVICE_ROLE_KEY']
);

async function updateRanking() {
    console.log("📊 Updating Ranking Scores...");
    
    // Formula Weights
    const W_SALES = 10;
    const W_VIEWS = 0.5;
    const W_RATING = 20;
    const W_RECENCY = 50; // Bonus points for sale in last 7 days

    // Need to join logic? Actually easier to select from products + analytics
    // Or just iterate product_analytics if we assume all have entries. 
    // safest is left join.
    const { data: products, error } = await supabase
        .from('products')
        .select(`
            id, 
            name, 
            rating, 
            product_analytics (
                views_count,
                sales_count,
                last_sale_at
            )
        `);

    if (error || !products) {
        console.error("Error fetching products:", error);
        return;
    }

    const updates = products.map(p => {
        // Flatten the joined analytics object (it comes as array or single obj depending on relationship)
        // Since 1:1, usually single object but supabase returns array unless .single() used on ID filter.
        // Actually returns object if relationship defined. Let's handle safely.
        const analytics = Array.isArray(p.product_analytics) ? p.product_analytics[0] : p.product_analytics;
        
        const sales = analytics?.sales_count || 0;
        const views = analytics?.views_count || 0;
        const rating = p.rating || 0; // Rating stays on product for now (or move to feedback table later)
        
        let recencyBonus = 0;
        if (analytics?.last_sale_at) {
            const daysSinceSale = (new Date().getTime() - new Date(analytics.last_sale_at).getTime()) / (1000 * 3600 * 24);
            if (daysSinceSale <= 7) recencyBonus = W_RECENCY;
        }

        const score = (sales * W_SALES) + (views * W_VIEWS) + (rating * W_RATING) + recencyBonus;

        return {
            id: p.id,
            name: p.name,
            ranking_score: parseFloat(score.toFixed(2))
        };
    });

    // Update loop 
    console.log(`Updating ${updates.length} products...`);
    let successCount = 0;
    
    for (const u of updates) {
        // Update the ANALYTICS table, not products
        const { error } = await supabase.from('product_analytics')
            .upsert({ 
                product_id: u.id, 
                ranking_score: u.ranking_score 
            }, { onConflict: 'product_id' });
            
        if (error) console.error(`Failed to update ${u.id}:`, error.message);
        else successCount++;
        
        if (successCount % 50 === 0) process.stdout.write('.');
    }
    console.log("\n");

    if (successCount === 0) {
        console.error("No scores updated.");
    } else {
        console.log(`✅ Updated ranking scores for ${updates.length} products.`);
        console.log("🏆 Top 5 Products:");
        updates.sort((a, b) => b.ranking_score - a.ranking_score).slice(0, 5).forEach((p, i) => {
            console.log(`   ${i+1}. ${p.name} (Score: ${p.ranking_score})`);
        });
    }
}

updateRanking();
