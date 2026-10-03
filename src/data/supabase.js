import { createClient } from "@supabase/supabase-js";

/* Both values come from Supabase Dashboard → Project Settings → API.
   The anon key is meant to be public — it is in every user's browser. What
   actually protects the data is the row-level security in supabase/schema.sql.
   Never put the service_role key in this file; it bypasses RLS entirely. */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && anonKey);

if (!isConfigured && import.meta.env.DEV) {
  console.warn(
    "Supabase is not configured. Copy .env.example to .env.local and fill in " +
      "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server."
  );
}

export const supabase = isConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // needed for the password-reset link
      },
    })
  : null;
