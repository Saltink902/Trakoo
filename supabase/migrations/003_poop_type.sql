-- add type (1–7) to poop_entries for Bristol scale
alter table public.poop_entries
  add column if not exists type smallint check (type >= 1 and type <= 7);

create index if not exists idx_poop_entries_type on public.poop_entries (type);
