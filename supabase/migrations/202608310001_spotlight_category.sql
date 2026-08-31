alter table public.profiles
add column if not exists spotlight_category text;

alter table public.profiles
drop constraint if exists profiles_spotlight_category_length;

alter table public.profiles
add constraint profiles_spotlight_category_length
check (
  spotlight_category is null
  or char_length(spotlight_category) <= 40
);