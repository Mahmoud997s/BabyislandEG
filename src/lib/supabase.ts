import { createBrowserClient } from '@supabase/ssr';

// Environment variables (Next.js)
// Use dummy values during build if environment variables are missing
// to prevent createBrowserClient from throwing.
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) || 'https://placeholder.supabase.co';
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) || 'placeholder-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  if (typeof window !== 'undefined') {
    console.error('Missing Supabase environment variables. Please check your .env.local file.');
  }
}

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);
