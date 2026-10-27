import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://qfknwmygntetelrwkrfy.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFma253bXlnbnRldGVscndrcmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NTI2NjgsImV4cCI6MjEwODQyODY2OH0.-1cBO3gdfGYW98GP8V2KUGY2u35acAkTC4bCK6QJNkE';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Guard against invalid or dead project references (e.g. legacy hcdzolduganjmbcsixxp or placeholder)
const isDeadOrPlaceholder = (url: string) =>
  !url ||
  url.includes('placeholder') ||
  url.includes('your-project') ||
  url.includes('hcdzolduganjmbcsixxp');

const validUrl = !isDeadOrPlaceholder(rawUrl) && rawUrl.startsWith('https://') && rawUrl.includes('.supabase.co')
  ? rawUrl
  : DEFAULT_SUPABASE_URL;

const validKey = rawKey && !rawKey.includes('placeholder') ? rawKey : DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  validUrl &&
  validKey &&
  validUrl.startsWith('https://') &&
  validUrl.includes('.supabase.co') &&
  !validUrl.includes('placeholder')
);

export const supabase: SupabaseClient = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
