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
  p_profile_song_url text,
  p_latest_pick_category text,
  p_latest_pick_title text,
  p_latest_pick_note text,
  p_latest_pick_url text
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

  perform public.update_profile_experience(
    p_username,
    p_display_name,
    p_bio,
    p_visibility,
    p_discoverable,
    p_avatar_url,
    p_cover_image_url,
    p_background_image_url,
    p_profile_accent_color,
    p_spotlight_title,
    p_spotlight_description,
    p_spotlight_url,
    p_landscape_image_fit,
    p_landscape_image_position_x,
    p_landscape_image_position_y,
    p_landscape_image_zoom,
    p_background_image_fit,
    p_background_image_position_x,
    p_background_image_position_y,
    p_background_image_zoom,
    p_profile_song_title,
    p_profile_song_artist,
    p_profile_song_url
  );

  if nullif(btrim(p_latest_pick_category), '') is not null
     and char_length(btrim(p_latest_pick_category)) > 40 then
    raise exception 'Latest Pick category is too long'
      using errcode = '22023';
  end if;

  if nullif(btrim(p_latest_pick_title), '') is not null
     and char_length(btrim(p_latest_pick_title)) > 100 then
    raise exception 'Latest Pick title is too long'
      using errcode = '22023';
  end if;

  if nullif(btrim(p_latest_pick_note), '') is not null
     and char_length(btrim(p_latest_pick_note)) > 240 then
    raise exception 'Latest Pick note is too long'
      using errcode = '22023';
  end if;

  if nullif(btrim(p_latest_pick_url), '') is not null
     and p_latest_pick_url !~ '^https?://' then
    raise exception 'Invalid Latest Pick URL'
      using errcode = '22023';
  end if;

  update public.profiles
  set latest_pick_category = nullif(btrim(p_latest_pick_category), ''),
      latest_pick_title = nullif(btrim(p_latest_pick_title), ''),
      latest_pick_note = nullif(btrim(p_latest_pick_note), ''),
      latest_pick_url = nullif(btrim(p_latest_pick_url), '')
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
  text,
  text,
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
  text,
  text,
  text,
  text,
  text
) to authenticated;