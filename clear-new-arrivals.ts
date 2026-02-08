
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearNewArrivals() {
  console.log('Clearing "New Arrival" (isNew) flag from all products...');
  
  const { data, error } = await supabase
    .from('products')
    .update({ isNew: false })
    .eq('isNew', true)
    .select();

  const count = (data as any[])?.length || 0;

  if (error) {
    console.error('Error clearing flags:', error);
  } else {
    console.log(`Successfully cleared "New Arrival" flag from ${count} products.`);
  }
}

clearNewArrivals();
