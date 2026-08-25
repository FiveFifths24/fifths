-- My Room phase-one foundation: one responsive room layout, lightweight
-- character customization, current vibe, and accessible motion preferences.

create table public.profile_rooms (
  user_id uuid primary key
    references public.profiles (id)
    on delete cascade,
  enabled boolean not null default true,
  wall_color text not null default '#241039',
  lighting_theme text not null default 'cosmic',
  current_vibe text not null default 'chill',
  character_color text not null default '#f359d2',
  character_shape text not null default 'ghost',
  character_expression text not null default 'smile',
  character_accessory text not null default 'headphones',
  motion_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profile_rooms_wall_color_hex
    check (wall_color ~ '^#[0-9a-f]{6}$'),
  constraint profile_rooms_character_color_hex
    check (character_color ~ '^#[0-9a-f]{6}$'),
  constraint profile_rooms_lighting_theme
    check (lighting_theme in ('cosmic', 'warm', 'daylight', 'midnight')),
  constraint profile_rooms_current_vibe
    check (current_vibe in ('chill', 'focused', 'gaming', 'creative', 'social')),
  constraint profile_rooms_character_shape
    check (character_shape in ('ghost', 'blob', 'orbit')),
  constraint profile_rooms_character_expression
    check (character_expression in ('smile', 'calm', 'wink')),
  constraint profile_rooms_character_accessory
    check (character_accessory in ('none', 'headphones', 'glasses', 'beanie'))
);

insert into public.profile_rooms (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

create trigger profile_rooms_set_updated_at
before update on public.profile_rooms
for each row execute function public.set_updated_at();

alter table public.profile_rooms enable row level security;

create policy "profile_rooms_select_own"
on public.profile_rooms
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.profile_rooms from anon, authenticated;
grant select on public.profile_rooms to authenticated;

create or replace function public.update_profile_room(
  p_enabled boolean,
  p_wall_color text,
  p_lighting_theme text,
  p_current_vibe text,
  p_character_color text,
  p_character_shape text,
  p_character_expression text,
  p_character_accessory text,
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
     or p_character_shape not in ('ghost', 'blob', 'orbit')
     or p_character_expression not in ('smile', 'calm', 'wink')
     or p_character_accessory not in ('none', 'headphones', 'glasses', 'beanie') then
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
    motion_enabled
  ) values (
    current_user_id,
    p_enabled,
    normalized_wall_color,
    p_lighting_theme,
    p_current_vibe,
    normalized_character_color,
    p_character_shape,
    p_character_expression,
    p_character_accessory,
    p_motion_enabled
  )
  on conflict (user_id) do update
  set enabled = excluded.enabled,
      wall_color = excluded.wall_color,
      lighting_theme = excluded.lighting_theme,
      current_vibe = excluded.current_vibe,
      character_color = excluded.character_color,
      character_shape = excluded.character_shape,
      character_expression = excluded.character_expression,
      character_accessory = excluded.character_accessory,
      motion_enabled = excluded.motion_enabled;
end;
$$;

revoke all on function public.update_profile_room(
  boolean, text, text, text, text, text, text, text, boolean
) from public;
grant execute on function public.update_profile_room(
  boolean, text, text, text, text, text, text, text, boolean
) to authenticated;

create or replace function public.get_profile_room(p_user_id uuid)
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
    coalesce(room.lighting_theme, 'cosmic'),
    coalesce(room.current_vibe, 'chill'),
    coalesce(room.character_color, '#f359d2'),
    coalesce(room.character_shape, 'ghost'),
    coalesce(room.character_expression, 'smile'),
    coalesce(room.character_accessory, 'headphones'),
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
      or (auth.uid() is not null and public.can_view_profile(profile.id))
    );
$$;

revoke all on function public.get_profile_room(uuid) from public;
grant execute on function public.get_profile_room(uuid) to anon, authenticated;
