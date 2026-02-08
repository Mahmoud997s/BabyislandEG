
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SmartClassifier } from './src/services/classification/SmartClassifier';

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
    envVars['SUPABASE_SERVICE_ROLE_KEY']
);

async function checkExamples() {
    console.log("🔍 Picking 5 Random Products to Audit AI Logic...\n");
    
    // Get 5 random products
    const { data: products } = await supabase.from('products').select('*').limit(5); 

    // Better: fetch a larger chunk and pick random js-side
    const { data: all, error } = await supabase.from('products').select('*').limit(50);
    
    if (error || !all) {
        console.error("Error fetching products:", error);
        return;
    }

    const randomProducts = all.sort(() => 0.5 - Math.random()).slice(0, 5);

    for (const p of randomProducts) {
        console.log(`------------------------------------------------`);
        console.log(`📦 Product: ${p.name}`);
        console.log(`📝 Desc: ${(p.description || '').substring(0, 50)}...`);
        console.log(`🖼️ Image: ${p.image || 'No Image'}`);
        
        const result = await SmartClassifier.classifyWithVision({
            name: p.name || '',
            name_ar: p.name_ar || '',
            description: p.description || '',
            breadcrumbs: [],
            url: p.source_url || '',
            imageUrls: p.image ? [p.image] : []
        }, envVars['OPENAI_API_KEY']);

        console.log(`\n🤖 AI Analysis:`);
        console.log(`   - Best Category: "${result.category_id}"`);
        console.log(`   - Confidence Score: ${result.confidence}`);
        console.log(`   - Is Ambiguous? ${result.isAmbiguous ? 'YES ⚠️' : 'NO ✅'}`);
        console.log(`   - Scores breakdown:`, JSON.stringify(result.allScores).substring(0, 100) + "...");
    }
    console.log(`\n------------------------------------------------`);
}

checkExamples();
