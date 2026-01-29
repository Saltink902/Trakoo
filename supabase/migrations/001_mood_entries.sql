-- mood_entries: store mood 1–5 per user
create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mood smallint not null check (mood >= 1 and mood <= 5),
  created_at timestamptz not null default now()
);

create index if not exists idx_mood_entries_user_id on public.mood_entries (user_id);
create index if not exists idx_mood_entries_created_at on public.mood_entries (created_at desc);

alter table public.mood_entries enable row level security;

create policy "Users can insert own mood_entries"
  on public.mood_entries for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can select own mood_entries"
  on public.mood_entries for select
  to authenticated
  using (auth.uid() = user_id);
