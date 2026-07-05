import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Read configuration from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://azkquwunkkccnhimcojq.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_oOkDtSXz9eHARhIEcaFtNw_iKPEsquz';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
