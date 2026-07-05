import { createClient } from '@supabase/supabase-js';

// Read configuration from environment variables, defaulting to the provided project identifiers
const supabaseUrl = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_SUPABASE_URL : undefined) || 
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL : undefined) || 
  'https://azkquwunkkccnhimcojq.supabase.co';

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_SUPABASE_ANON_KEY : undefined) || 
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY : undefined) || 
  'sb_publishable_oOkDtSXz9eHARhIEcaFtNw_iKPEsquz';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Helper to check if Supabase network is connected and accessible
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('songs').select('id').limit(1);
    return !error || error.code !== 'PGRST301';
  } catch (err) {
    return false;
  }
}
