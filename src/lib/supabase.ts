import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail fast so we don't silently fall back to localStorage in production.
  // Set these in `.env.local` (dev) or in your hosting provider env vars.
  throw new Error("Missing Supabase env vars: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // This app currently has no auth flow; we avoid storing sessions implicitly.
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
