/**
 * Supabase client
 * ─────────────────────────────────────────────────────────
 * Set these two values from your Supabase project:
 *   Settings → API → Project URL & anon/public key
 *
 * Create a .env.local file in the project root:
 *   VITE_SUPABASE_URL=https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=your-anon-key
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || '';
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const BUCKET = 'saill-media';   // Storage bucket name
export const TABLE  = 'saill_config';  // DB table name (key-value)

/** Returns true when Supabase is properly configured */
export const hasSupabase = () => !!supabase;
