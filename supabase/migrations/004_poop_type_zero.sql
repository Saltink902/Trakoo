-- allow type 0 (Constipation / no poop) in poop_entries
alter table public.poop_entries
  drop constraint if exists poop_entries_type_check;

alter table public.poop_entries
  add constraint poop_entries_type_check check (type >= 0 and type <= 7);
