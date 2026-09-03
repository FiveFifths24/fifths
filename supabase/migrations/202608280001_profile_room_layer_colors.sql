alter table public.profile_rooms
  add column if not exists floor_color text default '#4a403c',
  add column if not exists couch_color text default '#4a4048',
  add column if not exists bookshelf_color text default '#594139',
  add column if not exists tv_color text default '#262329',
  add column if not exists door_color text default '#4a3935',
  add column if not exists accessory_color text default '#5a5059';


create or replace function public.update_profile_room_layer_colors(
  p_floor_color text,
  p_couch_color text,
  p_bookshelf_color text,
  p_tv_color text,
  p_door_color text,
  p_accessory_color text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();

  normalized_floor_color text := lower(trim(p_floor_color));
  normalized_couch_color text := lower(trim(p_couch_color));
  normalized_bookshelf_color text := lower(trim(p_bookshelf_color));
  normalized_tv_color text := lower(trim(p_tv_color));
  normalized_door_color text := lower(trim(p_door_color));
  normalized_accessory_color text := lower(trim(p_accessory_color));
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if normalized_floor_color !~ '^#[0-9a-f]{6}$'
    or normalized_couch_color !~ '^#[0-9a-f]{6}$'
    or normalized_bookshelf_color !~ '^#[0-9a-f]{6}$'
    or normalized_tv_color !~ '^#[0-9a-f]{6}$'
    or normalized_door_color !~ '^#[0-9a-f]{6}$'
    or normalized_accessory_color !~ '^#[0-9a-f]{6}$'
  then
    raise exception 'Invalid room layer color'
      using errcode = '22023';
  end if;

  update public.profile_rooms
  set
    floor_color = normalized_floor_color,
    couch_color = normalized_couch_color,
    bookshelf_color = normalized_bookshelf_color,
    tv_color = normalized_tv_color,
    door_color = normalized_door_color,
    accessory_color = normalized_accessory_color
  where user_id = current_user_id;
end;
$$;


revoke all on function public.update_profile_room_layer_colors(
  text,
  text,
  text,
  text,
  text,
  text
) from public;

grant execute on function public.update_profile_room_layer_colors(
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;