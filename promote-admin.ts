
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env.local');
const prodEnvPath = path.join(__dirname, '.env.production');

let envVars: Record<string, string> = {};

// Helper to parse env file
const parseEnv = (filePath: string) => {
    if (fs.existsSync(filePath)) {
        const envContent = fs.readFileSync(filePath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                let cleanValue = value.trim().replace(/^["']|["']$/g, '');
                // Handle -NoNewline and literal \r\n sequences often found in Vercel exports
                if (cleanValue.startsWith('-NoNewline')) {
                     cleanValue = cleanValue.replace(/^-NoNewline/, '');
                     cleanValue = cleanValue.replace(/^(\\r\\n|\r\n|\n|\r|\s)+/, '');
                }
                // Determine if we still have trailing \r\n literals
                cleanValue = cleanValue.replace(/(\\r\\n|\r\n|\n|\r)+$/, '').trim();
                
                envVars[key.trim()] = cleanValue;
            }
        });
    }
};

// Try .env.local first, then .env.production
parseEnv(envPath);
if (!envVars['SUPABASE_SERVICE_ROLE_KEY']) {
    parseEnv(prodEnvPath);
}

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || envVars['VITE_SUPABASE_URL'];
const supabaseServiceRoleKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("❌ متغيرات البيئة ناقصة.");
  console.error("   تأكد من وجود NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في ملف .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const email = process.argv[2];

if (!email) {
  console.error("❌ Usage: npx tsx promote-admin.ts <email>");
  process.exit(1);
}

async function promoteUser() {
  console.log(`🔍 جاري البحث عن المستخدم: ${email}...`);

  // 1. Find User by Email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("❌ خطأ في استرجاع قائمة المستخدمين:", listError.message);
    return;
  }

  const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    console.error("❌ المستخدم ده مش موجود في قاعدة البيانات.");
    console.log("   من فضلك سجل حساب جديد الأول من هنا: " + (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + "/register");
    return;
  }

  const userId = user.id;
  console.log(`✅ تم العثور على حساب المستخدم: ${userId}`);

  // 2. Update Public Profile
  console.log(`🔄 جاري تحديث بيانات البروفايل...`);
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId);

  if (profileError) {
    console.error("❌ حصل مشكلة واحنا بنحدث جدول 'profiles':", profileError.message); 
    // Don't exit, try updating auth metadata too
  } else {
    console.log("✅ تم تحديث جدول 'profiles' بنجاح.");
  }

  // 3. Update Auth Metadata
  console.log(`🔄 جاري تحديث صلاحيات الدخول...`);
  const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role: 'admin' }
  });

  if (authError) {
    console.error("❌ حصل مشكلة في تحديث صلاحيات الدخول:", authError.message);
  } else {
    console.log("✅ تم تحديث صلاحيات المستخدم لـ 'admin' بنجاح.");
  }

  console.log("\n🎉 مبروك! الحساب بقى أدمن دلوقتي.");
  console.log("👉 من فضلك اعمل تسجيل خروج (Logout) وادخل تاني عشان تشوف لوحة التحكم.");
}

promoteUser();
