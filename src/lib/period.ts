import { supabase } from "./supabase";

export type PeriodEntry = {
  id?: string;
  user_id: string;
  period_date: string; // YYYY-MM-DD
  created_at?: string;
};

/** Toggle period day: add if not present, remove if present. Returns new state (true = period day). */
export async function togglePeriodDay(date: string): Promise<{
  isPeriodDay: boolean;
  error: unknown;
}> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { isPeriodDay: false, error: authError ?? new Error("Not signed in") };
  }

  const { data: existing } = await supabase
    .from("period_entries")
    .select("id")
    .eq("user_id", user.id)
    .eq("period_date", date)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("period_entries")
      .delete()
      .eq("user_id", user.id)
      .eq("period_date", date);
    return { isPeriodDay: false, error: error ?? null };
  }

  const { error } = await supabase.from("period_entries").insert({
    user_id: user.id,
    period_date: date,
  });
  return { isPeriodDay: true, error: error ?? null };
}

export async function getPeriodEntries(year?: number, month?: number): Promise<{
  data: PeriodEntry[] | null;
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
    .from("period_entries")
    .select("id, user_id, period_date, created_at")
    .eq("user_id", user.id)
    .order("period_date", { ascending: false });

  if (year != null) {
    const start = month != null ? `${year}-${String(month + 1).padStart(2, "0")}-01` : `${year}-01-01`;
    const end =
      month != null
        ? month === 11
          ? `${year + 1}-01-01`
          : `${year}-${String(month + 2).padStart(2, "0")}-01`
        : `${year + 1}-01-01`;
    query = query.gte("period_date", start).lt("period_date", end);
  }

  const { data, error } = await query;
  return { data: data as PeriodEntry[] | null, error: error ?? null };
}

export async function getPeriodByDate(date: string): Promise<{
  data: PeriodEntry | null;
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
    .from("period_entries")
    .select("id, user_id, period_date, created_at")
    .eq("user_id", user.id)
    .eq("period_date", date)
    .maybeSingle();

  return { data: data as PeriodEntry | null, error: error ?? null };
}

/** Returns array of date strings (YYYY-MM-DD) for period days in the given year/month. */
export async function getPeriodDatesArray(
  year?: number,
  month?: number
): Promise<{ data: string[]; error: unknown }> {
  const { data, error } = await getPeriodEntries(year, month);
  if (error || !data) return { data: [], error: error ?? null };
  return {
    data: data.map((e) => e.period_date),
    error: null,
  };
}
