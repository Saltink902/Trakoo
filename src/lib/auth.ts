import { supabase } from "./supabase";

/**
 * Ensure we have a session (anonymous or otherwise) so we can save mood_entries.
 * Call once when the dashboard mounts.
 */
export async function ensureSession(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) return;
  await supabase.auth.signInAnonymously();
}
