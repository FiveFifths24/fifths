-- Rich profile presentation: separate wallpaper and landscape media, a custom
-- accent color, expiring status, spotlight, social counts, and featured friends.

alter table public.profiles
add column background_image_url text,
add column profile_accent_color text not null default '#a855f7',
add column spotlight_title text,
add column spotlight_description text,
add column spotlight_url text,
add constraint profiles_accent_color_hex check (
  profile_accent_color ~ '^#[0-9a-fA-F]{6}$'
),
add constraint profiles_spotlight_title_length check (
  spotlight_title is null or char_length(spotlight_title) between 1 and 80
),
add constraint profiles_spotlight_description_length check (
  spotlight_description is null or char_length(spotlight_description) <= 240
),
add constraint profiles_spotlight_url_length check (
  spotlight_url is null or char_length(spotlight_url) <= 500
);

-- Preserve the appearance members already created. They can replace either
-- image independently after this migration.
update public.profiles
set background_image_url = cover_image_url
where cover_image_url is not null;

update storage.buckets
set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif'
]
where id = 'profile-media';

create table public.profile_statuses (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  status_text text not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now(),
  constraint profile_status_text_length check (
    char_length(btrim(status_text)) between 1 and 180
  )
);

create table public.profile_featured_connections (
  owner_id uuid not null references public.profiles (id) on delete cascade,
  featured_id uuid not null references public.profiles (id) on delete cascade,
  display_order smallint not null,
  created_at timestamptz not null default now(),
  primary key (owner_id, featured_id),
  unique (owner_id, display_order),
  constraint profile_featured_not_self check (owner_id <> featured_id),
  constraint profile_featured_order_range check (display_order between 1 and 8)
);

alter table public.profile_statuses enable row level security;
alter table public.profile_featured_connections enable row level security;

create policy "profile_statuses_select_own"
on public.profile_statuses for select to authenticated
using (user_id = (select auth.uid()));

create policy "profile_featured_connections_select_own"
on public.profile_featured_connections for select to authenticated
using (owner_id = (select auth.uid()));

revoke all on public.profile_statuses from anon, authenticated;
revoke all on public.profile_featured_connections from anon, authenticated;
grant select on public.profile_statuses to authenticated;
grant select on public.profile_featured_connections to authenticated;

create or replace function public.set_profile_status(p_status_text text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_status text := nullif(btrim(p_status_text), '');
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if normalized_status is null then
    delete from public.profile_statuses where user_id = current_user_id;
    return;
  end if;
  if char_length(normalized_status) > 180 then
    raise exception 'Status is too long' using errcode = '22023';
  end if;

  insert into public.profile_statuses (user_id, status_text, expires_at, updated_at)
  values (current_user_id, normalized_status, now() + interval '24 hours', now())
  on conflict (user_id) do update
  set status_text = excluded.status_text,
      expires_at = excluded.expires_at,
      updated_at = excluded.updated_at;
end;
$$;

revoke all on function public.set_profile_status(text) from public;
grant execute on function public.set_profile_status(text) to authenticated;

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
  p_spotlight_url text
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
      spotlight_url = nullif(btrim(p_spotlight_url), '')
  where id = current_user_id;
end;
$$;

revoke all on function public.update_profile_experience(
  text, text, text, public.profile_visibility, boolean, text, text, text,
  text, text, text, text
) from public;
grant execute on function public.update_profile_experience(
  text, text, text, public.profile_visibility, boolean, text, text, text,
  text, text, text, text
) to authenticated;

create or replace function public.set_featured_connections(p_featured_ids uuid[])
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
  if cardinality(p_featured_ids) > 8 then
    raise exception 'Choose no more than 8 featured connections' using errcode = '22023';
  end if;
  if cardinality(p_featured_ids) <> (
    select count(distinct featured_id) from unnest(p_featured_ids) featured_id
  ) then
    raise exception 'Featured connections must be unique' using errcode = '22023';
  end if;
  if exists (
    select 1
    from unnest(p_featured_ids) featured_id
    where not public.profiles_are_friends(current_user_id, featured_id)
       or public.profiles_are_blocked(current_user_id, featured_id)
  ) then
    raise exception 'Only current friends can be featured' using errcode = '22023';
  end if;

  delete from public.profile_featured_connections
  where owner_id = current_user_id;

  insert into public.profile_featured_connections (
    owner_id, featured_id, display_order
  )
  select current_user_id, featured_id, ordinal::smallint
  from unnest(p_featured_ids) with ordinality selected(featured_id, ordinal);
end;
$$;

revoke all on function public.set_featured_connections(uuid[]) from public;
grant execute on function public.set_featured_connections(uuid[]) to authenticated;

create or replace function public.get_profile_experience(p_user_id uuid)
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
  following_count bigint
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
    )
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
grant execute on function public.get_profile_experience(uuid) to anon, authenticated;

create or replace function public.get_featured_connections(p_owner_id uuid)
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  display_order smallint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    featured.id,
    featured.username::text,
    featured.display_name,
    featured.avatar_url,
    connection.display_order
  from public.profile_featured_connections connection
  join public.profiles owner on owner.id = connection.owner_id
  join public.profiles featured on featured.id = connection.featured_id
  where connection.owner_id = p_owner_id
    and auth.uid() is not null
    and public.can_view_profile(owner.id)
    and not public.profiles_are_blocked(auth.uid(), featured.id)
    and (
      owner.id = auth.uid()
      or owner.friend_list_visibility = 'members'
      or (
        owner.friend_list_visibility = 'friends'
        and public.profiles_are_friends(auth.uid(), owner.id)
      )
    )
  order by connection.display_order;
$$;

revoke all on function public.get_featured_connections(uuid) from public;
grant execute on function public.get_featured_connections(uuid) to authenticated;
