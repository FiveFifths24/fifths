-- Launch profile foundation: persistent Mood, approximate presence, one
-- curated external link, and privacy-preserving aggregate profile views.

alter table public.profiles
add column mood text,
add column last_seen_at timestamptz,
add column view_my_label text,
add column view_my_url text,
add constraint profiles_mood_length check (
  mood is null or char_length(btrim(mood)) between 1 and 40
),
add constraint profiles_view_my_label_length check (
  view_my_label is null or char_length(btrim(view_my_label)) between 1 and 50
),
add constraint profiles_view_my_url_length check (
  view_my_url is null or char_length(view_my_url) <= 500
),
add constraint profiles_view_my_pair check (
  (view_my_label is null and view_my_url is null)
  or (view_my_label is not null and view_my_url is not null)
);

create table public.profile_view_buckets (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  viewed_on date not null default (now() at time zone 'utc')::date,
  created_at timestamptz not null default now(),
  primary key (profile_id, viewer_id, viewed_on),
  constraint profile_views_not_self check (profile_id <> viewer_id)
);

create index profile_view_buckets_profile_idx
on public.profile_view_buckets (profile_id, viewed_on desc);

alter table public.profile_view_buckets enable row level security;
revoke all on public.profile_view_buckets from anon, authenticated;

create or replace function public.touch_profile_presence()
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  touched_at timestamptz;
begin
  if current_user_id is null then
    return null;
  end if;

  update public.profiles
  set last_seen_at = now()
  where id = current_user_id
    and (last_seen_at is null or last_seen_at < now() - interval '2 minutes')
  returning last_seen_at into touched_at;

  if touched_at is null then
    select last_seen_at into touched_at
    from public.profiles
    where id = current_user_id;
  end if;

  return touched_at;
end;
$$;

revoke all on function public.touch_profile_presence() from public;
grant execute on function public.touch_profile_presence() to authenticated;

create or replace function public.record_profile_view(p_profile_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  inserted_count integer;
begin
  if current_user_id is null or current_user_id = p_profile_id then
    return false;
  end if;
  if not public.can_view_profile(p_profile_id)
     or public.profiles_are_blocked(current_user_id, p_profile_id) then
    return false;
  end if;

  insert into public.profile_view_buckets (profile_id, viewer_id, viewed_on)
  values (p_profile_id, current_user_id, (now() at time zone 'utc')::date)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  return inserted_count = 1;
end;
$$;

revoke all on function public.record_profile_view(uuid) from public;
grant execute on function public.record_profile_view(uuid) to authenticated;

drop function public.update_profile_experience(
  text, text, text, public.profile_visibility, boolean, text, text, text,
  text, text, text, text, text, smallint, smallint, smallint, text, smallint,
  smallint, smallint, text, text, text, text, text, text, text
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
     or char_length(normalized_username) not between 3 and 30 then
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

drop function public.get_profile_experience(uuid);

create function public.get_profile_experience(p_user_id uuid)
returns table (
  background_image_url text,
  profile_accent_color text,
  status_text text,
  status_expires_at timestamptz,
  spotlight_title text,
  spotlight_description text,
  spotlight_url text,
  friend_count bigint,
  follower_count bigint,
  following_count bigint,
  landscape_image_fit text,
  landscape_image_position_x smallint,
  landscape_image_position_y smallint,
  landscape_image_zoom smallint,
  background_image_fit text,
  background_image_position_x smallint,
  background_image_position_y smallint,
  background_image_zoom smallint,
  mood text,
  last_seen_at timestamptz,
  profile_view_count bigint,
  view_my_label text,
  view_my_url text,
  profile_song_title text,
  profile_song_artist text,
  profile_song_url text,
  latest_pick_category text,
  latest_pick_title text,
  latest_pick_note text,
  latest_pick_url text,
  featured_profile_image_url text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    profile.background_image_url,
    profile.profile_accent_color,
    status.status_text,
    status.expires_at,
    profile.spotlight_title,
    profile.spotlight_description,
    profile.spotlight_url,
    (select count(*) from public.profile_friendships friendship
      where friendship.status = 'accepted'
        and (friendship.user_id_a = profile.id or friendship.user_id_b = profile.id)),
    (select count(*) from public.profile_follows follow
      where follow.followed_id = profile.id),
    (select count(*) from public.profile_follows follow
      where follow.follower_id = profile.id),
    profile.landscape_image_fit,
    profile.landscape_image_position_x,
    profile.landscape_image_position_y,
    profile.landscape_image_zoom,
    profile.background_image_fit,
    profile.background_image_position_x,
    profile.background_image_position_y,
    profile.background_image_zoom,
    profile.mood,
    profile.last_seen_at,
    (select count(*) from public.profile_view_buckets view
      where view.profile_id = profile.id),
    profile.view_my_label,
    profile.view_my_url,
    profile.profile_song_title,
    profile.profile_song_artist,
    profile.profile_song_url,
    profile.latest_pick_category,
    profile.latest_pick_title,
    profile.latest_pick_note,
    profile.latest_pick_url,
    profile.featured_profile_image_url
  from public.profiles profile
  left join lateral (
    select current_status.status_text, current_status.expires_at
    from public.profile_statuses current_status
    where current_status.user_id = profile.id
      and current_status.expires_at > now()
      and (
        profile.id = auth.uid()
        or (
          not exists (
            select 1 from public.profile_mutes mute
            where mute.muter_id = auth.uid() and mute.muted_id = profile.id
          )
          and not exists (
            select 1 from public.profile_blocked_words blocked_word
            where blocked_word.user_id = auth.uid()
              and position(blocked_word.word in lower(current_status.status_text)) > 0
          )
        )
      )
  ) status on true
  where profile.id = p_user_id
    and profile.onboarding_completed_at is not null
    and (
      profile.id = auth.uid()
      or (auth.uid() is null and profile.visibility = 'public')
      or (auth.uid() is not null and public.can_view_profile(profile.id))
    );
$$;

revoke all on function public.get_profile_experience(uuid) from public;
grant execute on function public.get_profile_experience(uuid)
to anon, authenticated;
