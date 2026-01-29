import { supabase } from "./supabase";
import type { MoodEntry } from "./mood";
import type { PoopEntry } from "./poop";
import type { IllnessEntry } from "./illness";

export type DayData = {
  date: string;
  mood?: MoodEntry;
  poop?: PoopEntry;
  illness?: IllnessEntry;
  notes?: string;
};

export async function getDayData(date: string): Promise<{
  data: DayData | null;
  error: unknown;
}> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    if (process.env.NODE_ENV === "development") {
      console.error("[getDayData] no user:", authError ?? "not signed in");
    }
    return { data: null, error: authError ?? new Error("Not signed in") };
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[getDayData] current user_id:", user.id);
  }

  const startOfDay = new Date(`${date}T00:00:00`).toISOString();
  const endOfDay = new Date(`${date}T23:59:59.999`).toISOString();

  const [moodRes, poopRes, illnessRes] = await Promise.all([
    supabase
      .from("mood_entries")
      .select("id, user_id, mood, notes, created_at")
      .eq("user_id", user.id)
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("poop_entries")
      .select("id, user_id, logged_at, type, notes")
      .eq("user_id", user.id)
      .gte("logged_at", startOfDay)
      .lte("logged_at", endOfDay)
      .order("logged_at", { ascending: false })
      .limit(1),
    supabase
      .from("illness_entries")
      .select("id, user_id, illness_types, notes, logged_at")
      .eq("user_id", user.id)
      .gte("logged_at", startOfDay)
      .lte("logged_at", endOfDay)
      .order("logged_at", { ascending: false })
      .limit(1),
  ]);

  if (process.env.NODE_ENV === "development") {
    if (moodRes.error) console.error("[getDayData] mood_entries:", moodRes.error);
    if (poopRes.error) console.error("[getDayData] poop_entries:", poopRes.error);
    if (illnessRes.error) console.error("[getDayData] illness_entries:", illnessRes.error);
  }

  const moodData = moodRes.data;
  const poopData = poopRes.data;
  const illnessData = illnessRes.data;

  const dayData: DayData = {
    date,
    mood: moodData && moodData.length > 0 ? (moodData[0] as MoodEntry) : undefined,
    poop: poopData && poopData.length > 0 ? (poopData[0] as PoopEntry) : undefined,
    illness: illnessData && illnessData.length > 0 ? (illnessData[0] as IllnessEntry) : undefined,
  };

  if (process.env.NODE_ENV === "development") {
    console.log("[getDayData]", date, "mood:", !!dayData.mood, "poop:", !!dayData.poop, "illness:", !!dayData.illness);
  }

  return { data: dayData, error: null };
}
