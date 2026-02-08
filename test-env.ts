import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log("__dirname:", __dirname);

const envPath = path.join(__dirname, '.env.local');
const prodEnvPath = path.join(__dirname, '.env.production');

let envVars: Record<string, string> = {};

const parseEnv = (filePath: string) => {
    if (fs.existsSync(filePath)) {
        console.log(`Parsing ${filePath}...`);
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
    } else {
        console.log(`File not found: ${filePath}`);
    }
};

parseEnv(envPath);
if (!envVars['SUPABASE_SERVICE_ROLE_KEY']) {
    parseEnv(prodEnvPath);
}

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || envVars['VITE_SUPABASE_URL'];
const supabaseServiceRoleKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

console.log("Supabase URL:", supabaseUrl);
console.log("Service Role Key (first 10 chars):", supabaseServiceRoleKey ? supabaseServiceRoleKey.substring(0, 10) : "MISSING");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("❌ Missing env vars (test script)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log("Supabase client created successfully.");
