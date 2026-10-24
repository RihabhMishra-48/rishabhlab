import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Ensure the URL is a valid https URL pointing to Supabase (not an API key by mistake)
export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl.startsWith('https://') &&
  rawUrl.includes('.supabase.co') &&
  !rawUrl.includes('placeholder') &&
  !rawUrl.includes('your-project')
);

const validUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder.supabase.co';
const validKey = isSupabaseConfigured ? rawKey : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
