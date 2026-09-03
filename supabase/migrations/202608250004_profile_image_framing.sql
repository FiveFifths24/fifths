-- Independent profile wallpaper and landscape framing controls.

alter table public.profiles
add column landscape_image_fit text not null default 'cover',
add column landscape_image_position_x smallint not null default 50,
add column landscape_image_position_y smallint not null default 50,
add column landscape_image_zoom smallint not null default 100,
add column background_image_fit text not null default 'cover',
add column background_image_position_x smallint not null default 50,
add column background_image_position_y smallint not null default 50,
add column background_image_zoom smallint not null default 100,
add constraint profiles_landscape_image_fit check (
  landscape_image_fit in ('cover', 'contain')
),
add constraint profiles_landscape_image_position_x check (
  landscape_image_position_x between 0 and 100
),
add constraint profiles_landscape_image_position_y check (
  landscape_image_position_y between 0 and 100
),
add constraint profiles_landscape_image_zoom check (
  landscape_image_zoom between 100 and 200
),
add constraint profiles_background_image_fit check (
  background_image_fit in ('cover', 'contain')
),
add constraint profiles_background_image_position_x check (
  background_image_position_x between 0 and 100
),
add constraint profiles_background_image_position_y check (
  background_image_position_y between 0 and 100
),
add constraint profiles_background_image_zoom check (
  background_image_zoom between 100 and 200
);

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
  p_background_image_zoom smallint
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
    select 1 from public.profiles
    where id <> current_user_id and username = normalized_username
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
      background_image_zoom = p_background_image_zoom
  where id = current_user_id;
end;
$$;

revoke all on function public.update_profile_experience(
  text, text, text, public.profile_visibility, boolean, text, text, text,
  text, text, text, text, text, smallint, smallint, smallint, text, smallint,
  smallint, smallint
) from public;
grant execute on function public.update_profile_experience(
  text, text, text, public.profile_visibility, boolean, text, text, text,
  text, text, text, text, text, smallint, smallint, smallint, text, smallint,
  smallint, smallint
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
  background_image_zoom smallint
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
    (
      select count(*) from public.profile_friendships friendship
      where friendship.status = 'accepted'
        and (friendship.user_id_a = profile.id or friendship.user_id_b = profile.id)
    ),
    (
      select count(*) from public.profile_follows profile_follow
      where profile_follow.followed_id = profile.id
    ),
    (
      select count(*) from public.profile_follows profile_follow
      where profile_follow.follower_id = profile.id
    ),
    profile.landscape_image_fit,
    profile.landscape_image_position_x,
    profile.landscape_image_position_y,
    profile.landscape_image_zoom,
    profile.background_image_fit,
    profile.background_image_position_x,
    profile.background_image_position_y,
    profile.background_image_zoom
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
