import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

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
      realtime: {
        transport: ws as any,
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
