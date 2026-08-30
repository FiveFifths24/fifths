alter table public.profiles
  add column if not exists current_game_description text,
  add column if not exists current_game_url text,
  add column if not exists current_reading_description text,
  add column if not exists current_reading_url text,
  add column if not exists current_food_description text,
  add column if not exists current_food_url text;

alter table public.profiles
  drop constraint if exists profiles_current_game_description_length;
alter table public.profiles
  add constraint profiles_current_game_description_length
  check (
    current_game_description is null
    or char_length(current_game_description) <= 240
  );

alter table public.profiles
  drop constraint if exists profiles_current_reading_description_length;
alter table public.profiles
  add constraint profiles_current_reading_description_length
  check (
    current_reading_description is null
    or char_length(current_reading_description) <= 240
  );

alter table public.profiles
  drop constraint if exists profiles_current_food_description_length;
alter table public.profiles
  add constraint profiles_current_food_description_length
  check (
    current_food_description is null
    or char_length(current_food_description) <= 240
  );

drop function if exists public.set_profile_current_fields(
  text,
  text,
  text
);

create function public.set_profile_current_fields(
  p_current_game text,
  p_current_game_description text,
  p_current_game_url text,
  p_current_reading text,
  p_current_reading_description text,
  p_current_reading_url text,
  p_current_food text,
  p_current_food_description text,
  p_current_food_url text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  update public.profiles
  set
    current_game = nullif(btrim(p_current_game), ''),
    current_game_description = nullif(btrim(p_current_game_description), ''),
    current_game_url = nullif(btrim(p_current_game_url), ''),
    current_reading = nullif(btrim(p_current_reading), ''),
    current_reading_description = nullif(btrim(p_current_reading_description), ''),
    current_reading_url = nullif(btrim(p_current_reading_url), ''),
    current_food = nullif(btrim(p_current_food), ''),
    current_food_description = nullif(btrim(p_current_food_description), ''),
    current_food_url = nullif(btrim(p_current_food_url), '')
  where id = current_user_id;
end;
$$;

revoke all on function public.set_profile_current_fields(
  text, text, text, text, text, text, text, text, text
) from public;

grant execute on function public.set_profile_current_fields(
  text, text, text, text, text, text, text, text, text
) to authenticated;