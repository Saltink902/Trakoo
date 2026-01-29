import { supabase } from "./supabase";

export type IllnessTypeId = "sick" | "fever" | "headache" | "stomach_bug" | "ulcer" | "advil";

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
  const { error } = await supabase.from("illness_entries").insert({
    user_id: user.id,
    illness_types: types.length ? types : [],
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

  if (year) {
    const startDate = `${year}-01-01T00:00:00Z`;
    const endDate = `${year + 1}-01-01T00:00:00Z`;
    query = query.gte("logged_at", startDate).lt("logged_at", endDate);
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

  const startOfDay = `${date}T00:00:00Z`;
  const endOfDay = `${date}T23:59:59Z`;

  const { data, error } = await supabase
    .from("illness_entries")
    .select("id, user_id, illness_types, notes, logged_at")
    .eq("user_id", user.id)
    .gte("logged_at", startOfDay)
    .lte("logged_at", endOfDay)
    .order("logged_at", { ascending: false })
    .limit(1);

  const entry = data && data.length > 0 ? (data[0] as IllnessEntry) : null;
  return { data: entry, error: error ?? null };
}
