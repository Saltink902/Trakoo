import type { MoodId } from "@/components/MoodCarousel";
import { supabase } from "./supabase";
import { getTodayDateString, dateToTimestamp, getYearRangeForQuery, getDateRangeForQuery, timestampToLocalDate } from "./dateUtils";

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
  // Save with explicit timestamp based on local date to avoid timezone issues
  const localDate = getTodayDateString();
  const timestamp = dateToTimestamp(localDate);

  const { error } = await supabase.from("mood_entries").insert({
    user_id: user.id,
    mood,
    created_at: timestamp,
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
  
  // Filter by year if provided (using wider range for timezone safety)
  if (year) {
    const { start, end } = getYearRangeForQuery(year);
    query = query.gte("created_at", start).lt("created_at", end);
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
  
  // Get entries for this specific date (using wider range for timezone safety)
  const { start, end } = getDateRangeForQuery(date);

  const { data, error } = await supabase
    .from("mood_entries")
    .select("id, user_id, mood, notes, created_at")
    .eq("user_id", user.id)
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: false });

  // Filter to only entries that match the requested local date
  const matchingEntry = data?.find((entry) => {
    if (!entry.created_at) return false;
    return timestampToLocalDate(entry.created_at) === date;
  });
  
  return {
    mood: matchingEntry as MoodEntry | undefined,
    error: error ?? null
  };
}
