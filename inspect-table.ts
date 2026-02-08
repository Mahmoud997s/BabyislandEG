
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
    envVars['SUPABASE_SERVICE_ROLE_KEY']
);

async function inspect() {
    console.log("🔍 Inspecting 'products' table structure...");
    
    // Fetch one row to see all columns
    const { data, error } = await supabase.from('products').select('*').limit(1);
    
    if (error) {
        console.error("Error:", error);
        return;
    }

    if (data && data.length > 0) {
        const keys = Object.keys(data[0]);
        console.log(`Found ${keys.length} columns:`);
        keys.sort().forEach(k => {
            const val = data[0][k];
            const type = typeof val;
            console.log(`- ${k}: ${type} (Example: ${val})`);
        });
    } else {
        console.log("Table is empty.");
    }
}

inspect();
