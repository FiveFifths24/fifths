alter table public.profiles
  add column if not exists current_game text,
  add column if not exists current_reading text,
  add column if not exists current_food text;

alter table public.profiles
  drop constraint if exists profiles_current_game_length;

alter table public.profiles
  add constraint profiles_current_game_length
  check (current_game is null or char_length(current_game) <= 100);

alter table public.profiles
  drop constraint if exists profiles_current_reading_length;

alter table public.profiles
  add constraint profiles_current_reading_length
  check (current_reading is null or char_length(current_reading) <= 100);

alter table public.profiles
  drop constraint if exists profiles_current_food_length;

alter table public.profiles
  add constraint profiles_current_food_length
  check (current_food is null or char_length(current_food) <= 100);