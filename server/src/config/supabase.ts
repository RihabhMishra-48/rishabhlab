import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://qfknwmygntetelrwkrfy.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFma253bXlnbnRldGVscndrcmZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mjg1MjY2OCwiZXhwIjoyMTA4NDI4NjY4fQ.0RAej44bjLan9n_pipuqt3_GO2whLQWV44MKJjH7cak';

export let supabase: SupabaseClient | null = null;

const isValidUrl = (url: string) => {
  return url && url.startsWith('http') && !url.includes('your-project');
};

if (isValidUrl(supabaseUrl) && supabaseKey && !supabaseKey.includes('your-supabase')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log('⚡ [Supabase] Connected to live Supabase project:', supabaseUrl);
  } catch (err: any) {
    console.error('❌ [Supabase] Connection error:', err.message);
  }
} else {
  console.log(
    'ℹ️ [Supabase] Live project credentials not yet specified in server/.env (see SUPABASE_SETUP.md). Ready for plug-and-play.'
  );
}

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabase && isValidUrl(supabaseUrl) && supabaseKey && !supabaseKey.includes('your-supabase'));
};
