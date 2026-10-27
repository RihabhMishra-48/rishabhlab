import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Guard against invalid or placeholder references
const isDeadOrPlaceholder = (url: string) =>
  !url ||
  url.includes('placeholder') ||
  url.includes('your-project') ||
  !url.startsWith('https://') ||
  !url.includes('.supabase.co');

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  !isDeadOrPlaceholder(rawUrl) &&
  !rawKey.includes('placeholder')
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
