-- food_entries: one entry per day per user (breakfast, lunch, snack, dinner)
create table if not exists public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  breakfast text,
  lunch text,
  snack text,
  dinner text,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_food_entries_user_id on public.food_entries (user_id);
create index if not exists idx_food_entries_logged_at on public.food_entries (logged_at desc);

alter table public.food_entries enable row level security;

create policy "Users can insert own food_entries"
  on public.food_entries for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can select own food_entries"
  on public.food_entries for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update own food_entries"
  on public.food_entries for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
