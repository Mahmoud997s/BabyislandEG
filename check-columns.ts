
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
} else {
    dotenv.config();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Use anon key for inspection if possible, or service role

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log('Checking columns for "products" table...');
    // We can't easily "describe" table via client, but we can try to select a non-existent column and see error,
    // or select * limit 1 and see keys.
    
    // Attempt 1: Select * limit 1
    const { data, error } = await supabase.from('products').select('*').limit(1);
    
    if (error) {
        console.error('Error selecting:', error);
        return;
    }
    
    if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]).sort().join(', '));
        if ('ranking_score' in data[0]) {
            console.log('✅ ranking_score exists on products table.');
        } else {
            console.log('❌ ranking_score MISSING from products table.');
        }
    } else {
        console.log('No rows found, cannot infer columns from data.');
        // fallback?
    }
}

checkColumns();
