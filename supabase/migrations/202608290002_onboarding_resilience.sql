-- Align onboarding and profile editing with the launch limits: handles are
-- 3-20 characters, interests allow up to 20, and skills remain capped at 12.

alter table public.profiles
drop constraint if exists profiles_username_length;

alter table public.profiles
add constraint profiles_username_length check (
  username is null or char_length(username::text) between 3 and 20
) not valid;

create or replace function public.complete_onboarding(
  p_username text,
  p_display_name text,
  p_pronouns text,
  p_timezone text,
  p_interest_ids uuid[],
  p_skill_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  requested_interest_count integer;
  active_interest_count integer;
  requested_skill_count integer;
  active_skill_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_username !~ '^[a-z0-9](?:[a-z0-9_]*[a-z0-9])?$'
     or char_length(p_username) not between 3 and 20 then
    raise exception 'Invalid username' using errcode = '22023';
  end if;
  if char_length(btrim(p_display_name)) not between 1 and 80 then
    raise exception 'Invalid display name' using errcode = '22023';
  end if;
  if p_pronouns is not null and char_length(p_pronouns) > 40 then
    raise exception 'Invalid pronouns' using errcode = '22023';
  end if;
  if p_timezone not in (
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Phoenix',
    'America/Los_Angeles'
  ) then
    raise exception 'Invalid timezone' using errcode = '22023';
  end if;

  select count(distinct id) into requested_interest_count
  from unnest(coalesce(p_interest_ids, '{}'::uuid[])) as selected(id);
  select count(*) into active_interest_count
  from public.interests
  where active and id = any(coalesce(p_interest_ids, '{}'::uuid[]));
  if requested_interest_count > 20
     or requested_interest_count <> active_interest_count then
    raise exception 'Invalid interest selection' using errcode = '22023';
  end if;

  select count(distinct id) into requested_skill_count
  from unnest(coalesce(p_skill_ids, '{}'::uuid[])) as selected(id);
  select count(*) into active_skill_count
  from public.skills
  where active and id = any(coalesce(p_skill_ids, '{}'::uuid[]));
  if requested_skill_count > 12
     or requested_skill_count <> active_skill_count then
    raise exception 'Invalid skill selection' using errcode = '22023';
  end if;

  update public.profiles
  set username = lower(btrim(p_username)),
      display_name = btrim(p_display_name),
      pronouns = nullif(btrim(p_pronouns), ''),
      timezone = p_timezone,
      age_confirmed_at = coalesce(age_confirmed_at, now()),
      onboarding_completed_at = now()
  where id = current_user_id;

  if not found then
    raise exception 'Profile not found' using errcode = 'P0002';
  end if;

  delete from public.profile_interests where user_id = current_user_id;
  insert into public.profile_interests (user_id, interest_id)
  select current_user_id, id
  from unnest(coalesce(p_interest_ids, '{}'::uuid[])) as selected(id)
  on conflict (user_id, interest_id) do nothing;

  delete from public.profile_skills where user_id = current_user_id;
  insert into public.profile_skills (user_id, skill_id)
  select current_user_id, id
  from unnest(coalesce(p_skill_ids, '{}'::uuid[])) as selected(id)
  on conflict (user_id, skill_id) do nothing;
end;
$$;

revoke all on function public.complete_onboarding(
  text, text, text, text, uuid[], uuid[]
) from public;
grant execute on function public.complete_onboarding(
  text, text, text, text, uuid[], uuid[]
) to authenticated;

-- The active profile editor RPC retains every launch-era parameter while
-- enforcing the same 20-character handle limit as onboarding.
create or replace function public.update_profile_experience(
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
  p_latest_pick_url text,
  p_mood text,
  p_view_my_label text,
  p_view_my_url text
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
  normalized_view_label text := nullif(btrim(p_view_my_label), '');
  normalized_view_url text := nullif(btrim(p_view_my_url), '');
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if normalized_username !~ '^[a-z0-9](?:[a-z0-9_]*[a-z0-9])?$'
     or char_length(normalized_username) not between 3 and 20 then
    raise exception 'Invalid username' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.profiles
    where id <> current_user_id and username = normalized_username
  ) then
    raise exception 'USERNAME_TAKEN' using errcode = '23505';
  end if;
  if char_length(btrim(p_display_name)) not between 1 and 80
     or (p_bio is not null and char_length(btrim(p_bio)) > 500)
     or normalized_accent !~ '^#[0-9a-f]{6}$' then
    raise exception 'Invalid profile content' using errcode = '22023';
  end if;
  if nullif(btrim(p_mood), '') is not null
     and char_length(btrim(p_mood)) > 40 then
    raise exception 'Mood is too long' using errcode = '22023';
  end if;
  if (normalized_view_label is null) <> (normalized_view_url is null)
     or (normalized_view_label is not null and char_length(normalized_view_label) > 50)
     or (normalized_view_url is not null and normalized_view_url !~ '^https?://') then
    raise exception 'Invalid View My link' using errcode = '22023';
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
     and char_length(btrim(p_profile_song_title)) > 100
     or nullif(btrim(p_profile_song_artist), '') is not null
     and char_length(btrim(p_profile_song_artist)) > 100
     or nullif(btrim(p_profile_song_url), '') is not null
     and p_profile_song_url !~ '^https?://' then
    raise exception 'Invalid profile soundtrack' using errcode = '22023';
  end if;
  if nullif(btrim(p_latest_pick_category), '') is not null
     and char_length(btrim(p_latest_pick_category)) > 40
     or nullif(btrim(p_latest_pick_title), '') is not null
     and char_length(btrim(p_latest_pick_title)) > 100
     or nullif(btrim(p_latest_pick_note), '') is not null
     and char_length(btrim(p_latest_pick_note)) > 240
     or nullif(btrim(p_latest_pick_url), '') is not null
     and p_latest_pick_url !~ '^https?://' then
    raise exception 'Invalid Latest Pick' using errcode = '22023';
  end if;
  if p_landscape_image_fit not in ('cover', 'contain')
     or p_background_image_fit not in ('cover', 'contain')
     or p_landscape_image_position_x not between 0 and 100
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
      mood = nullif(btrim(p_mood), ''),
      view_my_label = normalized_view_label,
      view_my_url = normalized_view_url,
      profile_song_title = nullif(btrim(p_profile_song_title), ''),
      profile_song_artist = nullif(btrim(p_profile_song_artist), ''),
      profile_song_url = nullif(btrim(p_profile_song_url), ''),
      latest_pick_category = nullif(btrim(p_latest_pick_category), ''),
      latest_pick_title = nullif(btrim(p_latest_pick_title), ''),
      latest_pick_note = nullif(btrim(p_latest_pick_note), ''),
      latest_pick_url = nullif(btrim(p_latest_pick_url), '')
  where id = current_user_id;
end;
$$;

revoke all on function public.update_profile_experience(
  text, text, text, public.profile_visibility, boolean, text, text, text,
  text, text, text, text, text, smallint, smallint, smallint, text, smallint,
  smallint, smallint, text, text, text, text, text, text, text, text, text, text
) from public;
grant execute on function public.update_profile_experience(
  text, text, text, public.profile_visibility, boolean, text, text, text,
  text, text, text, text, text, smallint, smallint, smallint, text, smallint,
  smallint, smallint, text, text, text, text, text, text, text, text, text, text
) to authenticated;
