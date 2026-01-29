-- add optional notes to mood_entries and poop_entries
alter table public.mood_entries
  add column if not exists notes text;

alter table public.poop_entries
  add column if not exists notes text;
