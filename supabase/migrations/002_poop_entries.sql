-- poop_entries: log bowel movements per user
create table if not exists public.poop_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  logged_at timestamptz not null default now()
);

create index if not exists idx_poop_entries_user_id on public.poop_entries (user_id);
create index if not exists idx_poop_entries_logged_at on public.poop_entries (logged_at desc);

alter table public.poop_entries enable row level security;

create policy "Users can insert own poop_entries"
  on public.poop_entries for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can select own poop_entries"
  on public.poop_entries for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own poop_entries"
  on public.poop_entries for delete
  to authenticated
  using (auth.uid() = user_id);
