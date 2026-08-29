alter table public.profiles
add column if not exists latest_pick_category text,
add column if not exists latest_pick_title text,
add column if not exists latest_pick_note text,
add column if not exists latest_pick_url text;

alter table public.profiles
drop constraint if exists profiles_latest_pick_category_length;

alter table public.profiles
add constraint profiles_latest_pick_category_length
check (
  latest_pick_category is null
  or char_length(latest_pick_category) <= 40
);

alter table public.profiles
drop constraint if exists profiles_latest_pick_title_length;

alter table public.profiles
add constraint profiles_latest_pick_title_length
check (
  latest_pick_title is null
  or char_length(latest_pick_title) <= 100
);

alter table public.profiles
drop constraint if exists profiles_latest_pick_note_length;

alter table public.profiles
add constraint profiles_latest_pick_note_length
check (
  latest_pick_note is null
  or char_length(latest_pick_note) <= 240
);

alter table public.profiles
drop constraint if exists profiles_latest_pick_url_format;

alter table public.profiles
add constraint profiles_latest_pick_url_format
check (
  latest_pick_url is null
  or latest_pick_url ~ '^https?://'
);