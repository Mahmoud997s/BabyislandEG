
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

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listStrollers() {
  console.log('Fetching strollers-gear products...');
  const { data, error } = await supabase
    .from('products')
    .select('id, name, images')
    .eq('category', 'strollers-gear')
    .limit(10);

  if (error || !data) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Found ${data.length} sample products.`);
  data.forEach((p: any) => {
    console.log(`- ${p.name}`);
    console.log(`  Image: ${p.images?.[0]}`);
  });
}

listStrollers();
