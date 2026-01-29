import { supabase } from "./supabase";

export type FoodEntry = {
  id?: string;
  user_id: string;
  breakfast?: string | null;
  lunch?: string | null;
  snack?: string | null;
  dinner?: string | null;
  logged_at?: string;
  created_at?: string;
};

/** Get local YYYY-MM-DD for today. */
function todayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Save meals for today. If an entry exists for today, updates it; otherwise inserts.
 * Partial saves allowed (only pass fields you want to set).
 */
export async function saveFood(
  breakfast?: string | null,
  lunch?: string | null,
  snack?: string | null,
  dinner?: string | null
): Promise<{ error: unknown; updated?: boolean }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: authError ?? new Error("Not signed in") };
  }

  const date = todayDateString();
  const { data: existing } = await getFoodByDate(date);

  if (existing) {
    const { error } = await updateFood(date, breakfast, lunch, snack, dinner);
    return { error: error ?? null, updated: true };
  }

  const startOfDay = `${date}T00:00:00Z`;
  const { error } = await supabase.from("food_entries").insert({
    user_id: user.id,
    logged_at: startOfDay,
    ...(breakfast !== undefined ? { breakfast: breakfast ?? null } : {}),
    ...(lunch !== undefined ? { lunch: lunch ?? null } : {}),
    ...(snack !== undefined ? { snack: snack ?? null } : {}),
    ...(dinner !== undefined ? { dinner: dinner ?? null } : {}),
  });
  return { error: error ?? null, updated: false };
}

export async function getFoodEntries(year?: number): Promise<{
  data: FoodEntry[] | null;
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
    .from("food_entries")
    .select("id, user_id, breakfast, lunch, snack, dinner, logged_at, created_at")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false });

  if (year) {
    const startDate = `${year}-01-01T00:00:00Z`;
    const endDate = `${year + 1}-01-01T00:00:00Z`;
    query = query.gte("logged_at", startDate).lt("logged_at", endDate);
  }

  const { data, error } = await query;
  return { data: data as FoodEntry[] | null, error: error ?? null };
}

export async function getFoodByDate(date: string): Promise<{
  data: FoodEntry | null;
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
    .from("food_entries")
    .select("id, user_id, breakfast, lunch, snack, dinner, logged_at, created_at")
    .eq("user_id", user.id)
    .gte("logged_at", startOfDay)
    .lte("logged_at", endOfDay)
    .order("logged_at", { ascending: false })
    .limit(1);

  const entry = data && data.length > 0 ? (data[0] as FoodEntry) : null;
  return { data: entry, error: error ?? null };
}

export async function updateFood(
  date: string,
  breakfast?: string | null,
  lunch?: string | null,
  snack?: string | null,
  dinner?: string | null
): Promise<{ error: unknown }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: authError ?? new Error("Not signed in") };
  }

  const { data: existing } = await getFoodByDate(date);
  if (!existing?.id) {
    return { error: new Error("No food entry found for this date") };
  }

  const updates: Partial<FoodEntry> = {};
  if (breakfast !== undefined) updates.breakfast = breakfast ?? null;
  if (lunch !== undefined) updates.lunch = lunch ?? null;
  if (snack !== undefined) updates.snack = snack ?? null;
  if (dinner !== undefined) updates.dinner = dinner ?? null;

  const { error } = await supabase
    .from("food_entries")
    .update(updates)
    .eq("id", existing.id)
    .eq("user_id", user.id);

  return { error: error ?? null };
}
