
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env.local');
const prodEnvPath = path.join(__dirname, '.env.production');

let envVars: Record<string, string> = {};

const parseEnv = (filePath: string) => {
    if (fs.existsSync(filePath)) {
        const envContent = fs.readFileSync(filePath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                let cleanValue = value.trim().replace(/^["']|["']$/g, '');
                if (cleanValue.startsWith('-NoNewline')) {
                     cleanValue = cleanValue.replace(/^-NoNewline/, '');
                     cleanValue = cleanValue.replace(/^(\\r\\n|\r\n|\n|\r|\s)+/, '');
                }
                cleanValue = cleanValue.replace(/(\\r\\n|\r\n|\n|\r)+$/, '').trim();
                envVars[key.trim()] = cleanValue;
            }
        });
    }
};

parseEnv(envPath);
if (!envVars['SUPABASE_SERVICE_ROLE_KEY']) {
    parseEnv(prodEnvPath);
}

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || envVars['VITE_SUPABASE_URL'];
const supabaseServiceRoleKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("❌ Missing environment variables (SUPABASE_SERVICE_ROLE_KEY)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function runAudit() {
  const targetEmail = 'Babyislandeg@proton.me';
  console.log(`\n🔍 --- Security Audit for ${targetEmail} ---\n`);

  // 1. Check Auth
  console.log("1. Checking Auth Table...");
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error("   ❌ Error listing Auth users:", authError.message);
  } else {
    const user = users.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (user) {
      console.log(`   ✅ User found in Auth. ID: ${user.id}`);
      console.log(`      Role in Metadata: ${user.user_metadata?.role || 'NONE'}`);
      console.log(`      Email Confirmed: ${user.email_confirmed_at ? 'YES' : 'NO'}`);
    } else {
      console.error("   ❌ User NOT found in Auth.");
    }
  }

  // 2. Check Profiles Table
  console.log("\n2. Checking Profiles Table...");
  const { data: profiles, error: profileError } = await supabase.from('profiles').select('*');
  if (profileError) {
    console.error("   ❌ Error reading Profiles (Admin Key):", profileError.message);
  } else {
    const profile = profiles.find(p => p.email?.toLowerCase() === targetEmail.toLowerCase() || p.id === users.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase())?.id);
    if (profile) {
      console.log(`   ✅ Profile found in DB.`);
      console.log(`      ID: ${profile.id}`);
      console.log(`      Role in DB: ${profile.role || 'NONE'}`);
      console.log(`      Email in DB: ${profile.email || 'NONE'}`);
    } else {
      console.error("   ❌ Profile NOT found in DB for this user.");
      console.log("      ⚠️ This is likely why the middleware is failing!");
    }
  }

  // 3. Check for Misnamed Columns
  if (profiles && profiles.length > 0) {
    console.log("\n3. Schema Sample (First Profile):");
    console.log("   Keys:", Object.keys(profiles[0]));
  }

  // 4. Check for 'user_roles' table (referenced in rolesService)
  console.log("\n4. Checking user_roles Table...");
  const { data: userRoles, error: urError } = await supabase.from('user_roles').select('*');
  if (urError) {
    console.log("   ℹ️ user_roles table might not exist or is protected differently.");
  } else {
    console.log(`   ✅ user_roles table exists with ${userRoles.length} entries.`);
    const ur = userRoles.find(r => r.user_id === users.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase())?.id);
    if (ur) {
      console.log(`      ✅ Found role entry for user: ${ur.role}`);
    } else {
      console.log(`      ❌ No entry found for this user in user_roles.`);
    }
  }

  console.log("\nAudit Complete.");
}

runAudit();
