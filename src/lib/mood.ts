import type { MoodId } from "@/components/MoodCarousel";
import { supabase } from "./supabase";

export type MoodEntry = {
  id?: string;
  user_id: string;
  mood: MoodId;
  notes?: string | null;
  created_at?: string;
};

export async function saveMood(
  mood: MoodId,
  notes?: string | null
): Promise<{ error: unknown }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: authError ?? new Error("Not signed in") };
  }
  const { error } = await supabase.from("mood_entries").insert({
    user_id: user.id,
    mood,
    ...(notes != null && notes !== "" ? { notes } : {}),
  });
  return { error: error ?? null };
}

export async function getMoodEntries(year?: number): Promise<{
  data: MoodEntry[] | null;
  error: unknown;
}> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    if (process.env.NODE_ENV === "development") {
      console.error("[getMoodEntries] no user:", authError ?? "not signed in");
    }
    return { data: null, error: authError ?? new Error("Not signed in") };
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[getMoodEntries] current user_id (compare with DB):", user.id);
  }

  let query = supabase
    .from("mood_entries")
    .select("id, user_id, mood, notes, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  
  // Filter by year if provided
  if (year) {
    const startDate = `${year}-01-01T00:00:00Z`;
    const endDate = `${year + 1}-01-01T00:00:00Z`;
    query = query.gte("created_at", startDate).lt("created_at", endDate);
  }
  
  const { data, error } = await query;
  if (process.env.NODE_ENV === "development" && error) {
    console.error("[getMoodEntries] supabase error:", error);
  }
  if (process.env.NODE_ENV === "development" && !error && data) {
    console.log("[getMoodEntries] rows:", data.length);
  }
  return { data: data as MoodEntry[] | null, error: error ?? null };
}

export async function getDayEntries(date: string): Promise<{
  mood?: MoodEntry;
  error: unknown;
}> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: authError ?? new Error("Not signed in") };
  }
  
  // Get entries for this specific date
  const startOfDay = `${date}T00:00:00Z`;
  const endOfDay = `${date}T23:59:59Z`;
  
  const { data, error } = await supabase
    .from("mood_entries")
    .select("id, user_id, mood, notes, created_at")
    .eq("user_id", user.id)
    .gte("created_at", startOfDay)
    .lte("created_at", endOfDay)
    .order("created_at", { ascending: false })
    .limit(1);
  
  return { 
    mood: data && data.length > 0 ? (data[0] as MoodEntry) : undefined,
    error: error ?? null 
  };
}
