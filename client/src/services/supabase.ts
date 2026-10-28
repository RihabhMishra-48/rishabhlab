import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://qfknwmygntetelrwkrfy.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFma253bXlnbnRldGVscndrcmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NTI2NjgsImV4cCI6MjEwODQyODY2OH0.-1cBO3gdfGYW98GP8V2KUGY2u35acAkTC4bCK6QJNkE';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();

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

const validUrl = isSupabaseConfigured ? rawUrl : DEFAULT_SUPABASE_URL;
const validKey = isSupabaseConfigured ? rawKey : DEFAULT_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
