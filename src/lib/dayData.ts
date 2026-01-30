import { supabase } from "./supabase";
import type { MoodEntry } from "./mood";
import type { PoopEntry } from "./poop";
import type { IllnessEntry } from "./illness";
import type { FoodEntry } from "./food";
import { getPeriodByDate } from "./period";
import { timestampToLocalDate, getDateRangeForQuery } from "./dateUtils";

export type DayData = {
  date: string;
  mood?: MoodEntry;
  poop?: PoopEntry;
  illness?: IllnessEntry;
  food?: FoodEntry;
  hasPeriod?: boolean;
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

  // Use a wide UTC window so we don't miss entries due to timezone (e.g. on phone).
  // Then filter in JS by local date so "today" is always the device's local day.
  const { start: startISO, end: endISO } = getDateRangeForQuery(date);

  const [moodRes, poopRes, illnessRes, foodRes, periodRes] = await Promise.all([
    supabase
      .from("mood_entries")
      .select("id, user_id, mood, notes, created_at")
      .eq("user_id", user.id)
      .gte("created_at", startISO)
      .lte("created_at", endISO)
      .order("created_at", { ascending: false }),
    supabase
      .from("poop_entries")
      .select("id, user_id, logged_at, type, notes")
      .eq("user_id", user.id)
      .gte("logged_at", startISO)
      .lte("logged_at", endISO)
      .order("logged_at", { ascending: false }),
    supabase
      .from("illness_entries")
      .select("id, user_id, illness_types, notes, logged_at")
      .eq("user_id", user.id)
      .gte("logged_at", startISO)
      .lte("logged_at", endISO)
      .order("logged_at", { ascending: false }),
    supabase
      .from("food_entries")
      .select("id, user_id, breakfast, lunch, snack, dinner, logged_at, created_at")
      .eq("user_id", user.id)
      .gte("logged_at", startISO)
      .lte("logged_at", endISO)
      .order("logged_at", { ascending: false }),
    getPeriodByDate(date),
  ]);

  if (process.env.NODE_ENV === "development") {
    if (moodRes.error) console.error("[getDayData] mood_entries:", moodRes.error);
    if (poopRes.error) console.error("[getDayData] poop_entries:", poopRes.error);
    if (illnessRes.error) console.error("[getDayData] illness_entries:", illnessRes.error);
    if (foodRes.error) console.error("[getDayData] food_entries:", foodRes.error);
    if (periodRes.error) console.error("[getDayData] period_entries:", periodRes.error);
  }

  const moodForDay = (moodRes.data ?? []).find((row) => {
    const at = (row as MoodEntry).created_at;
    return at != null && timestampToLocalDate(at) === date;
  }) as MoodEntry | undefined;
  const poopForDay = (poopRes.data ?? []).find((row) => {
    const at = (row as PoopEntry).logged_at;
    return at != null && timestampToLocalDate(at) === date;
  }) as PoopEntry | undefined;
  const illnessForDay = (illnessRes.data ?? []).find((row) => {
    const at = (row as IllnessEntry).logged_at;
    return at != null && timestampToLocalDate(at) === date;
  }) as IllnessEntry | undefined;
  const foodForDay = (foodRes.data ?? []).find((row) => {
    const at = (row as FoodEntry).logged_at;
    return at != null && timestampToLocalDate(at) === date;
  }) as FoodEntry | undefined;

  const hasPeriod = periodRes.data != null;

  const dayData: DayData = {
    date,
    mood: moodForDay,
    poop: poopForDay,
    illness: illnessForDay,
    food: foodForDay,
    hasPeriod,
  };

  if (process.env.NODE_ENV === "development") {
    console.log("[getDayData]", date, "mood:", !!dayData.mood, "poop:", !!dayData.poop, "illness:", !!dayData.illness, "food:", !!dayData.food, "period:", dayData.hasPeriod);
  }

  return { data: dayData, error: null };
}
