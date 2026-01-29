-- period_entries: one row per period day per user (individual dates, not ranges)
create table if not exists public.period_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  period_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, period_date)
);

create index if not exists idx_period_entries_user_id on public.period_entries (user_id);
create index if not exists idx_period_entries_period_date on public.period_entries (period_date desc);

alter table public.period_entries enable row level security;

create policy "Users can insert own period_entries"
  on public.period_entries for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can select own period_entries"
  on public.period_entries for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own period_entries"
  on public.period_entries for delete
  to authenticated
  using (auth.uid() = user_id);
