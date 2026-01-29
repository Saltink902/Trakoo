import type { PoopId } from "@/components/PoopCarousel";
import { supabase } from "./supabase";

export type PoopEntry = {
  id: string;
  user_id: string;
  logged_at: string;
  type?: number | null;
  notes?: string | null;
};

export async function logPoop(
  type: PoopId,
  notes?: string | null
): Promise<{ error: unknown }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: authError ?? new Error("Not signed in") };
  }
  const { error } = await supabase.from("poop_entries").insert({
    user_id: user.id,
    type,
    ...(notes != null && notes !== "" ? { notes } : {}),
  });
  return { error: error ?? null };
}

export async function getPoopEntries(): Promise<{
  data: PoopEntry[] | null;
  error: unknown;
}> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: null, error: authError ?? new Error("Not signed in") };
  }
  const { data, error } = await supabase
    .from("poop_entries")
    .select("id, user_id, logged_at, type, notes")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(50);
  return { data: data as PoopEntry[] | null, error: error ?? null };
}
