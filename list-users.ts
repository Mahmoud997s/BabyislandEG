
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env.local');

let envVars: Record<string, string> = {};

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
        }
    });
} else {
    console.error("❌ .env.local not found!");
}

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceRoleKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("❌ Missing environment variables in .env.local");
  console.error("   Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function listUsers() {
  console.log("🔍 جاري البحث عن الحسابات المسجلة...");

  // 1. List Auth Users
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error("❌ خطأ في استرجاع المستخدمين:", authError.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log("⚠️ مفيش أي حسابات مسجلة لسه.");
    return;
  }

  console.log(`✅ تم العثور على ${users.length} حساب:\n`);

  // 2. Fetch Profiles for extra detail (like name stored in DB)
  const { data: profiles } = await supabase.from('profiles').select('*');

  console.table(users.map(u => {
    const profile = profiles?.find(p => p.id === u.id);
    return {
      Email: u.email,
      Name: profile?.name || u.user_metadata?.name || '---',
      Role_Auth: u.user_metadata?.role || 'customer',
      Role_DB: profile?.role || '---',
      ID: u.id
    };
  }));
}

listUsers();
