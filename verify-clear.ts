
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

async function verifyClear() {
  console.log('Verifying "New Arrival" flags...');
  
  const { data, error } = await supabase
    .from('products')
    .select('id, name, isNew')
    .eq('isNew', true);

  if (error) {
    console.error('Error verifying:', error);
  } else {
    if (data && data.length > 0) {
        console.log(`WARNING: Found ${data.length} products still marked as New Arrival:`);
        data.forEach(p => console.log(`- ${p.name} (${p.id})`));
    } else {
        console.log('SUCCESS: No products are marked as New Arrival.');
    }
  }
}

verifyClear();
