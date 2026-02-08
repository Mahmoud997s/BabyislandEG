
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

async function verify() {
    const id = 1563; // From log
    const { data: product } = await supabase
        .from('products')
        .select('id, name, images')
        .eq('id', id)
        .eq('id', id)
        .single();
    
    if (!product) {
        console.log(`Product ${id} not found`);
        return;
    }

    console.log(`Product ${id}: ${product.name}`);
    console.log(`Images:`, product.images);
}

verify();
