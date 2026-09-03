-- Revised My Room character accessories. Day/night viewing is intentionally
-- browser-local and does not persist on the profile owner's room record.

alter table public.profile_rooms
add column head_accessory text not null default 'headphones',
add column face_accessory text not null default 'none',
add column neck_accessory text not null default 'none',
add constraint profile_rooms_head_accessory check (
  head_accessory in (
    'none', 'headphones', 'beanie', 'bow', 'hat', 'crown', 'flower', 'headband'
  )
),
add constraint profile_rooms_face_accessory check (
  face_accessory in ('none', 'glasses', 'sunglasses')
),
add constraint profile_rooms_neck_accessory check (
  neck_accessory in ('none', 'scarf', 'bandana')
);

update public.profile_rooms
set head_accessory = case character_accessory
      when 'headphones' then 'headphones'
      when 'beanie' then 'beanie'
      else 'none'
    end,
    face_accessory = case character_accessory
      when 'glasses' then 'glasses'
      else 'none'
    end;

drop function public.update_profile_room(
  boolean, text, text, text, text, text, text, text, boolean
);

create function public.update_profile_room(
  p_enabled boolean,
  p_wall_color text,
  p_lighting_theme text,
  p_current_vibe text,
  p_character_color text,
  p_head_accessory text,
  p_face_accessory text,
  p_neck_accessory text,
  p_motion_enabled boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_wall_color text := lower(btrim(p_wall_color));
  normalized_character_color text := lower(btrim(p_character_color));
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if normalized_wall_color !~ '^#[0-9a-f]{6}$'
     or normalized_character_color !~ '^#[0-9a-f]{6}$' then
    raise exception 'Invalid room color' using errcode = '22023';
  end if;
  if p_lighting_theme not in ('cosmic', 'warm', 'daylight', 'midnight')
     or p_current_vibe not in ('chill', 'focused', 'gaming', 'creative', 'social')
     or p_head_accessory not in (
       'none', 'headphones', 'beanie', 'bow', 'hat', 'crown', 'flower', 'headband'
     )
     or p_face_accessory not in ('none', 'glasses', 'sunglasses')
     or p_neck_accessory not in ('none', 'scarf', 'bandana') then
    raise exception 'Invalid room customization' using errcode = '22023';
  end if;

  insert into public.profile_rooms (
    user_id,
    enabled,
    wall_color,
    lighting_theme,
    current_vibe,
    character_color,
    character_shape,
    character_expression,
    character_accessory,
    head_accessory,
    face_accessory,
    neck_accessory,
    motion_enabled
  ) values (
    current_user_id,
    p_enabled,
    normalized_wall_color,
    p_lighting_theme,
    p_current_vibe,
    normalized_character_color,
    'ghost',
    'smile',
    'none',
    p_head_accessory,
    p_face_accessory,
    p_neck_accessory,
    p_motion_enabled
  )
  on conflict (user_id) do update
  set enabled = excluded.enabled,
      wall_color = excluded.wall_color,
      lighting_theme = excluded.lighting_theme,
      current_vibe = excluded.current_vibe,
      character_color = excluded.character_color,
      character_shape = 'ghost',
      character_expression = 'smile',
      character_accessory = 'none',
      head_accessory = excluded.head_accessory,
      face_accessory = excluded.face_accessory,
      neck_accessory = excluded.neck_accessory,
      motion_enabled = excluded.motion_enabled;
end;
$$;

revoke all on function public.update_profile_room(
  boolean, text, text, text, text, text, text, text, boolean
) from public;
grant execute on function public.update_profile_room(
  boolean, text, text, text, text, text, text, text, boolean
) to authenticated;

drop function public.get_profile_room(uuid);

create function public.get_profile_room(p_user_id uuid)
returns table (
  enabled boolean,
  wall_color text,
  lighting_theme text,
  current_vibe text,
  character_color text,
  character_shape text,
  character_expression text,
  character_accessory text,
  motion_enabled boolean,
  profile_song_title text,
  profile_song_artist text,
  profile_song_url text,
  head_accessory text,
  face_accessory text,
  neck_accessory text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(room.enabled, true),
    coalesce(room.wall_color, '#241039'),
    coalesce(room.lighting_theme, 'cosmic'),
    coalesce(room.current_vibe, 'chill'),
    coalesce(room.character_color, '#f359d2'),
    'ghost',
    'smile',
    'none',
    coalesce(room.motion_enabled, true),
    profile.profile_song_title,
    profile.profile_song_artist,
    profile.profile_song_url,
    coalesce(room.head_accessory, 'headphones'),
    coalesce(room.face_accessory, 'none'),
    coalesce(room.neck_accessory, 'none')
  from public.profiles profile
  left join public.profile_rooms room on room.user_id = profile.id
  where profile.id = p_user_id
    and profile.onboarding_completed_at is not null
    and (
      profile.id = auth.uid()
      or (auth.uid() is null and profile.visibility = 'public')
      or (auth.uid() is not null and public.can_view_profile(profile.id))
    );
$$;

revoke all on function public.get_profile_room(uuid) from public;
grant execute on function public.get_profile_room(uuid) to anon, authenticated;
