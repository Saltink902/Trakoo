import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Browser Supabase client for auth + data.
 * Auth options required for email/password + reset-password flow:
 * - persistSession: store tokens in storage
 * - autoRefreshToken: refresh before expiry
 * - detectSessionInUrl: parse tokens from reset-password redirect (required for reset links)
 *
 * Deployment: Supabase Dashboard → Auth → URL Configuration must include:
 * - Site URL: https://trakoo.vercel.app
 * - Additional Redirect URLs:
 *   http://localhost:3000/**
 *   https://trakoo.vercel.app/**
 *
 * Do NOT expose OPENAI keys or other secrets in client code.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
