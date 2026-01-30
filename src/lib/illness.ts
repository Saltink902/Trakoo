import { supabase } from "./supabase";
import { getTodayDateString, dateToTimestamp, getYearRangeForQuery, getDateRangeForQuery, timestampToLocalDate } from "./dateUtils";

export type IllnessTypeId =
  | "sick"
  | "fever"
  | "headache"
  | "stomach_bug"
  | "ulcer"
  | "advil"
  | "anxiety"
  | "bloating"
  | "cramps"
  | "fatigue"
  | "nausea";

export type IllnessType = {
  id: IllnessTypeId;
  label: string;
  color: string; // hex for calendar
  bg: string; // Tailwind e.g. bg-[#e8a8c4]
  icon: string;
};

export const ILLNESS_TYPES: IllnessType[] = [
  { id: "sick", label: "Sick", color: "#e8a8c4", bg: "bg-[#e8a8c4]", icon: "/illness/sick.png" },
  { id: "fever", label: "Fever", color: "#e8a0a0", bg: "bg-[#e8a0a0]", icon: "/illness/fever.png" },
  { id: "headache", label: "Headache", color: "#e5d4a8", bg: "bg-[#e5d4a8]", icon: "/illness/headache.png" },
  { id: "stomach_bug", label: "Stomach bug", color: "#c4a8e8", bg: "bg-[#c4a8e8]", icon: "/illness/bug.png?v=2" },
  { id: "ulcer", label: "Ulcer", color: "#a8e0b8", bg: "bg-[#a8e0b8]", icon: "/illness/ulcer.png" },
  { id: "advil", label: "Advil", color: "#a8c5e8", bg: "bg-[#a8c5e8]", icon: "/illness/advil.png" },
  { id: "anxiety", label: "Anxiety", color: "#d4b8e8", bg: "bg-[#d4b8e8]", icon: "/illness/anxiety.png" },
  { id: "bloating", label: "Bloating", color: "#b8e0d4", bg: "bg-[#b8e0d4]", icon: "/illness/bloating.png" },
  { id: "cramps", label: "Cramps", color: "#e8d4a8", bg: "bg-[#e8d4a8]", icon: "/illness/cramps.png" },
  { id: "fatigue", label: "Fatigue", color: "#a8c8e8", bg: "bg-[#a8c8e8]", icon: "/illness/fatigue.png" },
  { id: "nausea", label: "Nausea", color: "#e8b8c4", bg: "bg-[#e8b8c4]", icon: "/illness/nausea.png" },
];

export type IllnessEntry = {
  id?: string;
  user_id: string;
  illness_types: string[];
  notes?: string | null;
  logged_at?: string;
};

export async function logIllness(
  types: string[],
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

  const { error } = await supabase.from("illness_entries").insert({
    user_id: user.id,
    illness_types: types.length ? types : [],
    logged_at: timestamp,
    ...(notes != null && notes !== "" ? { notes } : {}),
  });
  return { error: error ?? null };
}

export async function getIllnessEntries(year?: number): Promise<{
  data: IllnessEntry[] | null;
  error: unknown;
}> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: null, error: authError ?? new Error("Not signed in") };
  }

  let query = supabase
    .from("illness_entries")
    .select("id, user_id, illness_types, notes, logged_at")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false });

  // Filter by year if provided (using wider range for timezone safety)
  if (year) {
    const { start, end } = getYearRangeForQuery(year);
    query = query.gte("logged_at", start).lt("logged_at", end);
  }

  const { data, error } = await query;
  return { data: data as IllnessEntry[] | null, error: error ?? null };
}

export async function getIllnessByDate(date: string): Promise<{
  data: IllnessEntry | null;
  error: unknown;
}> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: null, error: authError ?? new Error("Not signed in") };
  }

  // Use wider range for timezone safety
  const { start, end } = getDateRangeForQuery(date);

  const { data, error } = await supabase
    .from("illness_entries")
    .select("id, user_id, illness_types, notes, logged_at")
    .eq("user_id", user.id)
    .gte("logged_at", start)
    .lte("logged_at", end)
    .order("logged_at", { ascending: false });

  // Filter to only entries that match the requested local date
  const matchingEntry = data?.find((entry) => {
    if (!entry.logged_at) return false;
    return timestampToLocalDate(entry.logged_at) === date;
  });

  return { data: matchingEntry as IllnessEntry | null, error: error ?? null };
}
