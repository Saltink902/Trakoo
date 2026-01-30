import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/**
 * Get current auth session. Used for guards (redirect if logged in/out).
 */
export async function getSession(): Promise<Session | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
