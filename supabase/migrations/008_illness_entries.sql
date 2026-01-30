-- illness_entries: track symptoms and illnesses per day
create table if not exists public.illness_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  illness_types jsonb not null default '[]'::jsonb,
  notes text,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_illness_entries_user_id on public.illness_entries (user_id);
create index if not exists idx_illness_entries_logged_at on public.illness_entries (logged_at desc);

alter table public.illness_entries enable row level security;

create policy "Users can insert own illness_entries"
  on public.illness_entries for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can select own illness_entries"
  on public.illness_entries for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update own illness_entries"
  on public.illness_entries for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own illness_entries"
  on public.illness_entries for delete
  to authenticated
  using (auth.uid() = user_id);
