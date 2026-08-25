-- Member profiles, social relationships, personal content filters, and profile media.
-- All relationship mutations are routed through security-definer functions so
-- blocking can atomically sever friendships and follows in both directions.

create type public.friendship_status as enum ('pending', 'accepted');

create table public.profile_follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followed_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  constraint profile_follows_not_self check (follower_id <> followed_id)
);

create table public.profile_friendships (
  user_id_a uuid not null references public.profiles (id) on delete cascade,
  user_id_b uuid not null references public.profiles (id) on delete cascade,
  requested_by uuid not null references public.profiles (id) on delete cascade,
  status public.friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  primary key (user_id_a, user_id_b),
  constraint profile_friendships_ordered check (user_id_a::text < user_id_b::text),
  constraint profile_friendships_requester_participates check (
    requested_by = user_id_a or requested_by = user_id_b
  ),
  constraint profile_friendships_response_lifecycle check (
    (status = 'pending' and responded_at is null)
    or (status = 'accepted' and responded_at is not null)
  )
);

create table public.profile_blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  blocked_username text,
  blocked_display_name text,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint profile_blocks_not_self check (blocker_id <> blocked_id)
);

create table public.profile_mutes (
  muter_id uuid not null references public.profiles (id) on delete cascade,
  muted_id uuid not null references public.profiles (id) on delete cascade,
  muted_username text,
  muted_display_name text,
  created_at timestamptz not null default now(),
  primary key (muter_id, muted_id),
  constraint profile_mutes_not_self check (muter_id <> muted_id)
);

create table public.profile_blocked_words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  word text not null,
  created_at timestamptz not null default now(),
  constraint profile_blocked_words_length check (char_length(word) between 2 and 50),
  unique (user_id, word)
);

create index profile_follows_followed_idx
on public.profile_follows (followed_id, created_at desc);
create index profile_friendships_user_b_idx
on public.profile_friendships (user_id_b, status, created_at desc);
create index profile_blocks_blocked_idx
on public.profile_blocks (blocked_id);
create index profile_mutes_muted_idx
on public.profile_mutes (muted_id);

create or replace function public.profiles_are_blocked(first_user_id uuid, second_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profile_blocks
    where (blocker_id = first_user_id and blocked_id = second_user_id)
       or (blocker_id = second_user_id and blocked_id = first_user_id)
  );
$$;

create or replace function public.profiles_are_friends(first_user_id uuid, second_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profile_friendships
    where user_id_a = least(first_user_id::text, second_user_id::text)::uuid
      and user_id_b = greatest(first_user_id::text, second_user_id::text)::uuid
      and status = 'accepted'
  );
$$;

create or replace function public.can_view_profile(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles profile
    where profile.id = target_user_id
      and (
        profile.id = auth.uid()
        or (
          not public.profiles_are_blocked(auth.uid(), profile.id)
          and (
            profile.visibility in ('members', 'public')
            or public.profiles_are_friends(auth.uid(), profile.id)
          )
        )
      )
  );
$$;

revoke all on function public.profiles_are_blocked(uuid, uuid) from public;
revoke all on function public.profiles_are_friends(uuid, uuid) from public;
revoke all on function public.can_view_profile(uuid) from public;
grant execute on function public.profiles_are_blocked(uuid, uuid) to authenticated;
grant execute on function public.profiles_are_friends(uuid, uuid) to authenticated;
grant execute on function public.can_view_profile(uuid) to authenticated;

create policy "profile_interests_select_visible_members"
on public.profile_interests for select
to authenticated
using (public.can_view_profile(user_id));

create policy "profile_skills_select_visible_members"
on public.profile_skills for select
to authenticated
using (public.can_view_profile(user_id));

alter table public.profile_follows enable row level security;
alter table public.profile_friendships enable row level security;
alter table public.profile_blocks enable row level security;
alter table public.profile_mutes enable row level security;
alter table public.profile_blocked_words enable row level security;

create policy "profile_follows_select_participating"
on public.profile_follows for select to authenticated
using (follower_id = (select auth.uid()) or followed_id = (select auth.uid()));

create policy "profile_friendships_select_participating"
on public.profile_friendships for select to authenticated
using (user_id_a = (select auth.uid()) or user_id_b = (select auth.uid()));

create policy "profile_blocks_select_own"
on public.profile_blocks for select to authenticated
using (blocker_id = (select auth.uid()));

create policy "profile_mutes_select_own"
on public.profile_mutes for select to authenticated
using (muter_id = (select auth.uid()));

create policy "profile_blocked_words_select_own"
on public.profile_blocked_words for select to authenticated
using (user_id = (select auth.uid()));

revoke all on public.profile_follows from anon, authenticated;
revoke all on public.profile_friendships from anon, authenticated;
revoke all on public.profile_blocks from anon, authenticated;
revoke all on public.profile_mutes from anon, authenticated;
revoke all on public.profile_blocked_words from anon, authenticated;
grant select on public.profile_follows to authenticated;
grant select on public.profile_friendships to authenticated;
grant select on public.profile_blocks to authenticated;
grant select on public.profile_mutes to authenticated;
grant select on public.profile_blocked_words to authenticated;
grant usage on type public.friendship_status to authenticated;

create or replace function public.update_profile_settings(
  p_username text,
  p_display_name text,
  p_bio text,
  p_visibility public.profile_visibility,
  p_discoverable boolean,
  p_avatar_url text,
  p_cover_image_url text
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
  if p_username !~ '^[a-z0-9](?:[a-z0-9_]*[a-z0-9])?$'
     or char_length(p_username) not between 3 and 30 then
    raise exception 'Invalid username' using errcode = '22023';
  end if;
  if char_length(btrim(p_display_name)) not between 1 and 80 then
    raise exception 'Invalid display name' using errcode = '22023';
  end if;
  if p_bio is not null and char_length(btrim(p_bio)) > 500 then
    raise exception 'Bio is too long' using errcode = '22023';
  end if;

  update public.profiles
  set username = lower(btrim(p_username)),
      display_name = btrim(p_display_name),
      bio = nullif(btrim(p_bio), ''),
      visibility = p_visibility,
      discoverable = p_discoverable,
      avatar_url = nullif(p_avatar_url, ''),
      cover_image_url = nullif(p_cover_image_url, '')
  where id = current_user_id;
end;
$$;

revoke all on function public.update_profile_settings(text, text, text, public.profile_visibility, boolean, text, text) from public;
grant execute on function public.update_profile_settings(text, text, text, public.profile_visibility, boolean, text, text) to authenticated;

create or replace function public.set_profile_visibility(p_visibility public.profile_visibility)
returns void language sql security definer set search_path = '' as $$
  update public.profiles set visibility = p_visibility where id = auth.uid();
$$;
revoke all on function public.set_profile_visibility(public.profile_visibility) from public;
grant execute on function public.set_profile_visibility(public.profile_visibility) to authenticated;

create or replace function public.get_member_profiles(
  p_username text default null,
  p_discoverable_only boolean default false
)
returns table (
  id uuid,
  username text,
  display_name text,
  pronouns text,
  bio text,
  avatar_url text,
  cover_image_url text,
  city text,
  region text,
  location_visibility public.location_visibility,
  friend_list_visibility public.friend_list_visibility,
  discoverable boolean,
  visibility public.profile_visibility,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    profile.id,
    profile.username::text,
    profile.display_name,
    profile.pronouns,
    profile.bio,
    profile.avatar_url,
    profile.cover_image_url,
    case when profile.location_visibility = 'city_region' then profile.city else null end,
    case when profile.location_visibility in ('city_region', 'region_only') then profile.region else null end,
    profile.location_visibility,
    profile.friend_list_visibility,
    profile.discoverable,
    profile.visibility,
    profile.created_at
  from public.profiles profile
  where auth.uid() is not null
    and profile.onboarding_completed_at is not null
    and public.can_view_profile(profile.id)
    and (p_username is null or profile.username = lower(btrim(p_username)))
    and (not p_discoverable_only or profile.discoverable);
$$;
revoke all on function public.get_member_profiles(text, boolean) from public;
grant execute on function public.get_member_profiles(text, boolean) to authenticated;

create or replace function public.get_public_profile(p_username text)
returns table (
  id uuid,
  username text,
  display_name text,
  pronouns text,
  bio text,
  avatar_url text,
  cover_image_url text,
  city text,
  region text,
  location_visibility public.location_visibility,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    profile.id,
    profile.username::text,
    profile.display_name,
    profile.pronouns,
    profile.bio,
    profile.avatar_url,
    profile.cover_image_url,
    case when profile.location_visibility = 'city_region' then profile.city else null end,
    case when profile.location_visibility in ('city_region', 'region_only') then profile.region else null end,
    profile.location_visibility,
    profile.created_at
  from public.profiles profile
  where profile.username = lower(btrim(p_username))
    and profile.visibility = 'public'
    and profile.onboarding_completed_at is not null;
$$;
revoke all on function public.get_public_profile(text) from public;
grant execute on function public.get_public_profile(text) to anon, authenticated;

create or replace function public.public_profile_media_visible(p_object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (storage.foldername(p_object_name))[1]::uuid
      and visibility = 'public'
      and onboarding_completed_at is not null
  );
$$;
revoke all on function public.public_profile_media_visible(text) from public;
grant execute on function public.public_profile_media_visible(text) to anon, authenticated;

create or replace function public.follow_profile(p_target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare current_user_id uuid := auth.uid();
begin
  if current_user_id is null or current_user_id = p_target_user_id
     or public.profiles_are_blocked(current_user_id, p_target_user_id) then
    raise exception 'This profile cannot be followed' using errcode = '42501';
  end if;
  insert into public.profile_follows (follower_id, followed_id)
  values (current_user_id, p_target_user_id)
  on conflict do nothing;
  perform private.issue_notification(
    p_target_user_id,
    'new_follower',
    'You have a new follower',
    'A SIGNAL member followed your profile.',
    null,
    'follow:' || current_user_id::text || ':' || p_target_user_id::text
  );
end;
$$;

create or replace function public.unfollow_profile(p_target_user_id uuid)
returns void language sql security definer set search_path = '' as $$
  delete from public.profile_follows
  where follower_id = auth.uid() and followed_id = p_target_user_id;
$$;

create or replace function public.remove_follower(p_follower_user_id uuid)
returns void language sql security definer set search_path = '' as $$
  delete from public.profile_follows
  where follower_id = p_follower_user_id and followed_id = auth.uid();
$$;

create or replace function public.send_friend_request(p_target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  first_id uuid;
  second_id uuid;
  requests_allowed boolean;
begin
  if current_user_id is null or current_user_id = p_target_user_id
     or public.profiles_are_blocked(current_user_id, p_target_user_id) then
    raise exception 'This friend request cannot be sent' using errcode = '42501';
  end if;
  select allow_friend_requests into requests_allowed
  from public.profile_connection_preferences where user_id = p_target_user_id;
  if coalesce(requests_allowed, true) is false then
    raise exception 'This member is not accepting friend requests' using errcode = '42501';
  end if;
  first_id := least(current_user_id::text, p_target_user_id::text)::uuid;
  second_id := greatest(current_user_id::text, p_target_user_id::text)::uuid;
  insert into public.profile_friendships (user_id_a, user_id_b, requested_by)
  values (first_id, second_id, current_user_id)
  on conflict (user_id_a, user_id_b) do nothing;
  perform private.issue_notification(
    p_target_user_id,
    'friend_request',
    'New friend request',
    'A SIGNAL member wants to add you as a friend.',
    '/home/people',
    'friend-request:' || first_id::text || ':' || second_id::text
  );
end;
$$;

create or replace function public.accept_friend_request(p_requester_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  first_id uuid := least(auth.uid()::text, p_requester_user_id::text)::uuid;
  second_id uuid := greatest(auth.uid()::text, p_requester_user_id::text)::uuid;
begin
  update public.profile_friendships
  set status = 'accepted', responded_at = now()
  where user_id_a = first_id and user_id_b = second_id
    and requested_by = p_requester_user_id and status = 'pending'
    and not public.profiles_are_blocked(current_user_id, p_requester_user_id);
  if not found then
    raise exception 'Friend request not found' using errcode = 'P0002';
  end if;
  perform private.issue_notification(
    p_requester_user_id,
    'friend_accepted',
    'Friend request accepted',
    'You are now friends on SIGNAL.',
    '/home/people',
    'friend-accepted:' || first_id::text || ':' || second_id::text
  );
end;
$$;

create or replace function public.remove_friendship(p_target_user_id uuid)
returns void language sql security definer set search_path = '' as $$
  delete from public.profile_friendships
  where user_id_a = least(auth.uid()::text, p_target_user_id::text)::uuid
    and user_id_b = greatest(auth.uid()::text, p_target_user_id::text)::uuid;
$$;

create or replace function public.block_profile(p_target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_username text;
  target_display_name text;
begin
  if current_user_id is null or current_user_id = p_target_user_id then
    raise exception 'This profile cannot be blocked' using errcode = '42501';
  end if;
  select username::text, display_name into target_username, target_display_name
  from public.profiles where id = p_target_user_id;
  if not found then raise exception 'Profile not found' using errcode = 'P0002'; end if;

  insert into public.profile_blocks (
    blocker_id, blocked_id, blocked_username, blocked_display_name
  ) values (
    current_user_id, p_target_user_id, target_username, target_display_name
  ) on conflict (blocker_id, blocked_id) do nothing;

  delete from public.profile_follows
  where (follower_id = current_user_id and followed_id = p_target_user_id)
     or (follower_id = p_target_user_id and followed_id = current_user_id);
  delete from public.profile_friendships
  where user_id_a = least(current_user_id::text, p_target_user_id::text)::uuid
    and user_id_b = greatest(current_user_id::text, p_target_user_id::text)::uuid;
  delete from public.profile_mutes
  where muter_id = current_user_id and muted_id = p_target_user_id;
end;
$$;

create or replace function public.unblock_profile(p_target_user_id uuid)
returns void language sql security definer set search_path = '' as $$
  delete from public.profile_blocks
  where blocker_id = auth.uid() and blocked_id = p_target_user_id;
$$;

create or replace function public.mute_profile(p_target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_username text;
  target_display_name text;
begin
  if current_user_id is null or current_user_id = p_target_user_id
     or public.profiles_are_blocked(current_user_id, p_target_user_id) then
    raise exception 'This profile cannot be muted' using errcode = '42501';
  end if;
  select username::text, display_name into target_username, target_display_name
  from public.profiles where id = p_target_user_id;
  insert into public.profile_mutes (muter_id, muted_id, muted_username, muted_display_name)
  values (current_user_id, p_target_user_id, target_username, target_display_name)
  on conflict do nothing;
end;
$$;

create or replace function public.unmute_profile(p_target_user_id uuid)
returns void language sql security definer set search_path = '' as $$
  delete from public.profile_mutes
  where muter_id = auth.uid() and muted_id = p_target_user_id;
$$;

create or replace function public.add_blocked_word(p_word text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare new_id uuid;
begin
  if char_length(lower(btrim(p_word))) not between 2 and 50 then
    raise exception 'Blocked words must use 2 to 50 characters' using errcode = '22023';
  end if;
  insert into public.profile_blocked_words (user_id, word)
  values (auth.uid(), lower(btrim(p_word)))
  on conflict (user_id, word) do update set word = excluded.word
  returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.remove_blocked_word(p_word_id uuid)
returns void language sql security definer set search_path = '' as $$
  delete from public.profile_blocked_words
  where id = p_word_id and user_id = auth.uid();
$$;

revoke all on function public.follow_profile(uuid) from public;
revoke all on function public.unfollow_profile(uuid) from public;
revoke all on function public.remove_follower(uuid) from public;
revoke all on function public.send_friend_request(uuid) from public;
revoke all on function public.accept_friend_request(uuid) from public;
revoke all on function public.remove_friendship(uuid) from public;
revoke all on function public.block_profile(uuid) from public;
revoke all on function public.unblock_profile(uuid) from public;
revoke all on function public.mute_profile(uuid) from public;
revoke all on function public.unmute_profile(uuid) from public;
revoke all on function public.add_blocked_word(text) from public;
revoke all on function public.remove_blocked_word(uuid) from public;
grant execute on function public.follow_profile(uuid) to authenticated;
grant execute on function public.unfollow_profile(uuid) to authenticated;
grant execute on function public.remove_follower(uuid) to authenticated;
grant execute on function public.send_friend_request(uuid) to authenticated;
grant execute on function public.accept_friend_request(uuid) to authenticated;
grant execute on function public.remove_friendship(uuid) to authenticated;
grant execute on function public.block_profile(uuid) to authenticated;
grant execute on function public.unblock_profile(uuid) to authenticated;
grant execute on function public.mute_profile(uuid) to authenticated;
grant execute on function public.unmute_profile(uuid) to authenticated;
grant execute on function public.add_blocked_word(text) to authenticated;
grant execute on function public.remove_blocked_word(uuid) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-media',
  'profile-media',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "profile_media_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "profile_media_update_own"
on storage.objects for update to authenticated
using (
  bucket_id = 'profile-media'
  and owner_id = (select auth.uid()::text)
)
with check (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "profile_media_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'profile-media'
  and owner_id = (select auth.uid()::text)
);

create policy "profile_media_select_authenticated"
on storage.objects for select to authenticated
using (
  bucket_id = 'profile-media'
  and public.can_view_profile((storage.foldername(name))[1]::uuid)
);

create policy "profile_media_select_public"
on storage.objects for select to anon
using (
  bucket_id = 'profile-media'
  and public.public_profile_media_visible(name)
);
