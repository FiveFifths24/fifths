-- Add profile music support to profile experience updates
-- and limit Friend Spotlight to three friends.

drop function if exists public.update_profile_experience(
  text,
  text,
  text,
  public.profile_visibility,
  boolean,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  smallint,
  smallint,
  smallint,
  text,
  smallint,
  smallint,
  smallint
);

create function public.update_profile_experience(
  p_username text,
  p_display_name text,
  p_bio text,
  p_visibility public.profile_visibility,
  p_discoverable boolean,
  p_avatar_url text,
  p_cover_image_url text,
  p_background_image_url text,
  p_profile_accent_color text,
  p_spotlight_title text,
  p_spotlight_description text,
  p_spotlight_url text,
  p_landscape_image_fit text,
  p_landscape_image_position_x smallint,
  p_landscape_image_position_y smallint,
  p_landscape_image_zoom smallint,
  p_background_image_fit text,
  p_background_image_position_x smallint,
  p_background_image_position_y smallint,
  p_background_image_zoom smallint,
  p_profile_song_title text,
  p_profile_song_artist text,
  p_profile_song_url text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_username text := lower(btrim(p_username));
  normalized_accent text := lower(btrim(p_profile_accent_color));
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if normalized_username !~ '^[a-z0-9](?:[a-z0-9_]*[a-z0-9])?$'
     or char_length(normalized_username) not between 3 and 30 then
    raise exception 'Invalid username' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.profiles
    where id <> current_user_id
      and username = normalized_username
  ) then
    raise exception 'USERNAME_TAKEN' using errcode = '23505';
  end if;

  if char_length(btrim(p_display_name)) not between 1 and 80 then
    raise exception 'Invalid display name' using errcode = '22023';
  end if;

  if p_bio is not null and char_length(btrim(p_bio)) > 500 then
    raise exception 'Bio is too long' using errcode = '22023';
  end if;

  if normalized_accent !~ '^#[0-9a-f]{6}$' then
    raise exception 'Invalid accent color' using errcode = '22023';
  end if;

  if nullif(btrim(p_spotlight_title), '') is not null
     and char_length(btrim(p_spotlight_title)) > 80 then
    raise exception 'Spotlight title is too long' using errcode = '22023';
  end if;

  if nullif(btrim(p_spotlight_description), '') is not null
     and char_length(btrim(p_spotlight_description)) > 240 then
    raise exception 'Spotlight description is too long' using errcode = '22023';
  end if;

  if nullif(btrim(p_spotlight_url), '') is not null
     and p_spotlight_url !~ '^https?://' then
    raise exception 'Invalid spotlight URL' using errcode = '22023';
  end if;

  if nullif(btrim(p_profile_song_title), '') is not null
     and char_length(btrim(p_profile_song_title)) > 100 then
    raise exception 'Song title is too long' using errcode = '22023';
  end if;

  if nullif(btrim(p_profile_song_artist), '') is not null
     and char_length(btrim(p_profile_song_artist)) > 100 then
    raise exception 'Song artist is too long' using errcode = '22023';
  end if;

  if nullif(btrim(p_profile_song_url), '') is not null
     and p_profile_song_url !~ '^https?://' then
    raise exception 'Invalid song URL' using errcode = '22023';
  end if;

  if p_landscape_image_fit not in ('cover', 'contain')
     or p_background_image_fit not in ('cover', 'contain') then
    raise exception 'Invalid image fit' using errcode = '22023';
  end if;

  if p_landscape_image_position_x not between 0 and 100
     or p_landscape_image_position_y not between 0 and 100
     or p_background_image_position_x not between 0 and 100
     or p_background_image_position_y not between 0 and 100
     or p_landscape_image_zoom not between 100 and 200
     or p_background_image_zoom not between 100 and 200 then
    raise exception 'Invalid image framing' using errcode = '22023';
  end if;

  update public.profiles
  set username = normalized_username,
      display_name = btrim(p_display_name),
      bio = nullif(btrim(p_bio), ''),
      visibility = p_visibility,
      discoverable = p_discoverable,
      avatar_url = nullif(p_avatar_url, ''),
      cover_image_url = nullif(p_cover_image_url, ''),
      background_image_url = nullif(p_background_image_url, ''),
      profile_accent_color = normalized_accent,
      spotlight_title = nullif(btrim(p_spotlight_title), ''),
      spotlight_description = nullif(btrim(p_spotlight_description), ''),
      spotlight_url = nullif(btrim(p_spotlight_url), ''),
      landscape_image_fit = p_landscape_image_fit,
      landscape_image_position_x = p_landscape_image_position_x,
      landscape_image_position_y = p_landscape_image_position_y,
      landscape_image_zoom = p_landscape_image_zoom,
      background_image_fit = p_background_image_fit,
      background_image_position_x = p_background_image_position_x,
      background_image_position_y = p_background_image_position_y,
      background_image_zoom = p_background_image_zoom,
      profile_song_title = nullif(btrim(p_profile_song_title), ''),
      profile_song_artist = nullif(btrim(p_profile_song_artist), ''),
      profile_song_url = nullif(btrim(p_profile_song_url), '')
  where id = current_user_id;
end;
$$;

revoke all on function public.update_profile_experience(
  text,
  text,
  text,
  public.profile_visibility,
  boolean,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  smallint,
  smallint,
  smallint,
  text,
  smallint,
  smallint,
  smallint,
  text,
  text,
  text
) from public;

grant execute on function public.update_profile_experience(
  text,
  text,
  text,
  public.profile_visibility,
  boolean,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  smallint,
  smallint,
  smallint,
  text,
  smallint,
  smallint,
  smallint,
  text,
  text,
  text
) to authenticated;


-- Keep Friend Spotlight at a maximum of three.

delete from public.profile_featured_connections
where display_order > 3;

alter table public.profile_featured_connections
drop constraint if exists profile_featured_order_range;

alter table public.profile_featured_connections
add constraint profile_featured_order_range
check (display_order between 1 and 3);

create or replace function public.set_featured_connections(
  p_featured_ids uuid[]
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
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if cardinality(p_featured_ids) > 3 then
    raise exception 'Choose no more than 3 featured connections'
      using errcode = '22023';
  end if;

  if cardinality(p_featured_ids) <> (
    select count(distinct featured_id)
    from unnest(p_featured_ids) featured_id
  ) then
    raise exception 'Featured connections must be unique'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from unnest(p_featured_ids) featured_id
    where not public.profiles_are_friends(current_user_id, featured_id)
       or public.profiles_are_blocked(current_user_id, featured_id)
  ) then
    raise exception 'Only current friends can be featured'
      using errcode = '22023';
  end if;

  delete from public.profile_featured_connections
  where owner_id = current_user_id;

  insert into public.profile_featured_connections (
    owner_id,
    featured_id,
    display_order
  )
  select
    current_user_id,
    featured_id,
    ordinal::smallint
  from unnest(p_featured_ids)
  with ordinality selected(featured_id, ordinal);
end;
$$;

revoke all on function public.set_featured_connections(uuid[]) from public;

grant execute on function public.set_featured_connections(uuid[])
to authenticated;