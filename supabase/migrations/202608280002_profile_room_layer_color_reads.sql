drop function if exists public.get_profile_room(uuid);

create function public.get_profile_room(p_user_id uuid)
returns table (
  enabled boolean,
  wall_color text,
  floor_color text,
  couch_color text,
  bookshelf_color text,
  tv_color text,
  door_color text,
  accessory_color text,
  lighting_theme text,
  current_vibe text,
  character_color text,
  character_shape text,
  character_expression text,
  character_accessory text,
  head_accessory text,
  face_accessory text,
  neck_accessory text,
  motion_enabled boolean,
  profile_song_title text,
  profile_song_artist text,
  profile_song_url text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(room.enabled, true),
    coalesce(room.wall_color, '#241039'),
    coalesce(room.floor_color, '#4a403c'),
    coalesce(room.couch_color, '#4a4048'),
    coalesce(room.bookshelf_color, '#594139'),
    coalesce(room.tv_color, '#262329'),
    coalesce(room.door_color, '#4a3935'),
    coalesce(room.accessory_color, '#5a5059'),
    coalesce(room.lighting_theme, 'cosmic'),
    coalesce(room.current_vibe, 'chill'),
    coalesce(room.character_color, '#f359d2'),
    coalesce(room.character_shape, 'ghost'),
    coalesce(room.character_expression, 'smile'),
    coalesce(room.character_accessory, 'none'),
    coalesce(room.head_accessory, 'headphones'),
    coalesce(room.face_accessory, 'none'),
    coalesce(room.neck_accessory, 'none'),
    coalesce(room.motion_enabled, true),
    profile.profile_song_title,
    profile.profile_song_artist,
    profile.profile_song_url
  from public.profiles profile
  left join public.profile_rooms room on room.user_id = profile.id
  where profile.id = p_user_id
    and profile.onboarding_completed_at is not null
    and (
      profile.id = auth.uid()
      or (auth.uid() is null and profile.visibility = 'public')
      or (
        auth.uid() is not null
        and public.can_view_profile(profile.id)
      )
    );
$$;

revoke all on function public.get_profile_room(uuid) from public;
grant execute on function public.get_profile_room(uuid) to anon, authenticated;