-- Intentional social activity, friend-scoped privacy controls, finite retrieval,
-- and progressive abuse controls. Activity references canonical source rows and
-- is never used as analytics or passive browsing history.

create type public.signal_activity_type as enum (
  'session_created',
  'session_joined',
  'circle_created',
  'circle_joined',
  'profile_status_updated',
  'profile_music_updated',
  'profile_featured_media_updated',
  'profile_recommendation_updated',
  'commons_created'
);

create type public.signal_activity_entity_type as enum (
  'profile',
  'session',
  'circle',
  'opportunity'
);

create table public.activity_sharing_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  share_with_friends boolean not null default true,
  share_session_activity boolean not null default true,
  share_circle_activity boolean not null default true,
  share_profile_activity boolean not null default true,
  share_commons_activity boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger activity_sharing_preferences_set_updated_at
before update on public.activity_sharing_preferences
for each row execute function public.set_updated_at();

create table public.signal_activity_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.profiles (id) on delete cascade,
  activity_type public.signal_activity_type not null,
  entity_type public.signal_activity_entity_type not null,
  entity_id uuid not null,
  dedupe_key text not null,
  created_at timestamptz not null default now(),
  constraint signal_activity_events_dedupe_key_length
    check (char_length(dedupe_key) between 10 and 180),
  unique (dedupe_key)
);

create index signal_activity_events_actor_created_idx
on public.signal_activity_events (actor_user_id, created_at desc, id);

create index signal_activity_events_type_created_idx
on public.signal_activity_events (activity_type, created_at desc, id);

create index signal_activity_events_entity_idx
on public.signal_activity_events (entity_type, entity_id);

create table private.action_rate_limits (
  actor_user_id uuid not null,
  action_key text not null,
  window_started_at timestamptz not null,
  attempt_count integer not null default 1,
  primary key (actor_user_id, action_key, window_started_at),
  constraint action_rate_limits_key_length
    check (char_length(action_key) between 3 and 80),
  constraint action_rate_limits_count_positive check (attempt_count > 0)
);

create index action_rate_limits_expiry_idx
on private.action_rate_limits (window_started_at);

revoke all on private.action_rate_limits from public, anon, authenticated;

create or replace function private.claim_action_rate_limit(
  p_actor_user_id uuid,
  p_action_key text,
  p_max_attempts integer,
  p_window interval
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_window timestamptz;
  new_count integer;
begin
  if p_actor_user_id is null
     or p_max_attempts < 1
     or p_window < interval '1 minute' then
    raise exception 'Invalid rate-limit request' using errcode = '22023';
  end if;

  current_window := date_bin(p_window, now(), timestamptz '2000-01-01 00:00:00+00');

  insert into private.action_rate_limits (
    actor_user_id,
    action_key,
    window_started_at,
    attempt_count
  ) values (
    p_actor_user_id,
    p_action_key,
    current_window,
    1
  )
  on conflict (actor_user_id, action_key, window_started_at)
  do update set attempt_count = private.action_rate_limits.attempt_count + 1
  returning attempt_count into new_count;

  if new_count > p_max_attempts then
    raise exception 'Please slow down and try again later' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function private.claim_action_rate_limit(uuid, text, integer, interval)
from public, anon, authenticated;

create or replace function private.record_signal_activity(
  p_actor_user_id uuid,
  p_activity_type public.signal_activity_type,
  p_entity_type public.signal_activity_entity_type,
  p_entity_id uuid,
  p_dedupe_key text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_actor_user_id is null or p_entity_id is null then
    return;
  end if;

  insert into public.signal_activity_events (
    actor_user_id,
    activity_type,
    entity_type,
    entity_id,
    dedupe_key
  ) values (
    p_actor_user_id,
    p_activity_type,
    p_entity_type,
    p_entity_id,
    p_dedupe_key
  )
  on conflict (dedupe_key)
  do update set created_at = now();
end;
$$;

revoke all on function private.record_signal_activity(
  uuid,
  public.signal_activity_type,
  public.signal_activity_entity_type,
  uuid,
  text
) from public, anon, authenticated;

create or replace function private.capture_profile_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if row(new.profile_song_title, new.profile_song_artist, new.profile_song_url)
     is distinct from
     row(old.profile_song_title, old.profile_song_artist, old.profile_song_url)
     and coalesce(new.profile_song_title, new.profile_song_artist, new.profile_song_url) is not null then
    perform private.record_signal_activity(
      new.id,
      'profile_music_updated',
      'profile',
      new.id,
      'profile_music_updated:' || new.id::text
    );
  end if;

  if row(new.latest_pick_category, new.latest_pick_title, new.latest_pick_note, new.latest_pick_url)
     is distinct from
     row(old.latest_pick_category, old.latest_pick_title, old.latest_pick_note, old.latest_pick_url)
     and coalesce(new.latest_pick_title, new.latest_pick_note) is not null then
    perform private.record_signal_activity(
      new.id,
      'profile_recommendation_updated',
      'profile',
      new.id,
      'profile_recommendation_updated:' || new.id::text
    );
  end if;

  return new;
end;
$$;

create trigger profiles_capture_meaningful_activity
after update of profile_song_title, profile_song_artist, profile_song_url,
  latest_pick_category, latest_pick_title, latest_pick_note, latest_pick_url
on public.profiles
for each row execute function private.capture_profile_activity();

create or replace function private.capture_profile_status_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.record_signal_activity(
    new.user_id,
    'profile_status_updated',
    'profile',
    new.user_id,
    'profile_status_updated:' || new.user_id::text
  );
  return new;
end;
$$;

create trigger profile_statuses_capture_activity
after insert or update of status_text on public.profile_statuses
for each row execute function private.capture_profile_status_activity();

create or replace function private.capture_session_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'published'
     and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    perform private.record_signal_activity(
      new.host_user_id,
      'session_created',
      'session',
      new.id,
      'session_created:' || new.id::text
    );
  end if;
  return new;
end;
$$;

create trigger sessions_capture_activity
after insert or update of status on public.sessions
for each row execute function private.capture_session_activity();

create or replace function private.capture_registration_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'registered'
     and (tg_op = 'INSERT' or old.status is distinct from 'registered') then
    perform private.record_signal_activity(
      new.user_id,
      'session_joined',
      'session',
      new.session_id,
      'session_joined:' || new.session_id::text || ':' || new.user_id::text
    );
  end if;
  return new;
end;
$$;

create trigger registrations_capture_activity
after insert or update of status on public.registrations
for each row execute function private.capture_registration_activity();

create or replace function private.capture_circle_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'published'
     and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    perform private.record_signal_activity(
      new.created_by,
      'circle_created',
      'circle',
      new.id,
      'circle_created:' || new.id::text
    );
  end if;
  return new;
end;
$$;

create trigger circles_capture_activity
after insert or update of status on public.circles
for each row execute function private.capture_circle_activity();

create or replace function private.capture_circle_membership_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'active'
     and new.role <> 'owner'
     and (tg_op = 'INSERT' or old.status is distinct from 'active') then
    perform private.record_signal_activity(
      new.user_id,
      'circle_joined',
      'circle',
      new.circle_id,
      'circle_joined:' || new.circle_id::text || ':' || new.user_id::text
    );
  end if;
  return new;
end;
$$;

create trigger circle_members_capture_activity
after insert or update of status on public.circle_members
for each row execute function private.capture_circle_membership_activity();

create or replace function private.capture_commons_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'published'
     and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    perform private.record_signal_activity(
      new.created_by,
      'commons_created',
      'opportunity',
      new.id,
      'commons_created:' || new.id::text
    );
  end if;
  return new;
end;
$$;

create trigger creator_opportunities_capture_activity
after insert or update of status on public.creator_opportunities
for each row execute function private.capture_commons_activity();

create or replace function private.enforce_signal_action_rate_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
begin
  actor_id := coalesce(auth.uid(),
    case tg_table_name
      when 'direct_messages' then new.sender_id
      when 'profile_follows' then new.follower_id
      when 'profile_friendships' then new.requested_by
      when 'registrations' then new.user_id
      when 'circle_members' then new.user_id
      when 'sessions' then new.host_user_id
      when 'circles' then new.created_by
      when 'creator_opportunities' then new.created_by
      else null
    end
  );

  if tg_table_name = 'direct_messages' then
    perform private.claim_action_rate_limit(actor_id, 'direct_message', 30, interval '10 minutes');
    perform private.claim_action_rate_limit(
      actor_id,
      'direct_message_repeat:' || md5(lower(btrim(new.body))),
      5,
      interval '1 hour'
    );
  elsif tg_table_name = 'profile_follows' then
    perform private.claim_action_rate_limit(actor_id, 'follow', 60, interval '1 hour');
  elsif tg_table_name = 'profile_friendships' then
    perform private.claim_action_rate_limit(actor_id, 'friend_request', 30, interval '1 day');
  elsif tg_table_name = 'registrations' then
    perform private.claim_action_rate_limit(actor_id, 'session_registration', 30, interval '1 hour');
  elsif tg_table_name = 'circle_members' and new.role <> 'owner' then
    perform private.claim_action_rate_limit(actor_id, 'circle_membership', 30, interval '1 hour');
  elsif tg_table_name = 'sessions' then
    perform private.claim_action_rate_limit(actor_id, 'session_create', 10, interval '1 day');
  elsif tg_table_name = 'circles' then
    perform private.claim_action_rate_limit(actor_id, 'circle_create', 5, interval '1 day');
  elsif tg_table_name = 'creator_opportunities' then
    perform private.claim_action_rate_limit(actor_id, 'commons_create', 10, interval '1 day');
  end if;

  return new;
end;
$$;

create trigger direct_messages_progressive_rate_limit
before insert on public.direct_messages
for each row execute function private.enforce_signal_action_rate_limits();
create trigger profile_follows_progressive_rate_limit
before insert on public.profile_follows
for each row execute function private.enforce_signal_action_rate_limits();
create trigger profile_friendships_progressive_rate_limit
before insert on public.profile_friendships
for each row execute function private.enforce_signal_action_rate_limits();
create trigger registrations_progressive_rate_limit
before insert on public.registrations
for each row execute function private.enforce_signal_action_rate_limits();
create trigger circle_members_progressive_rate_limit
before insert on public.circle_members
for each row execute function private.enforce_signal_action_rate_limits();
create trigger sessions_progressive_rate_limit
before insert on public.sessions
for each row execute function private.enforce_signal_action_rate_limits();
create trigger circles_progressive_rate_limit
before insert on public.circles
for each row execute function private.enforce_signal_action_rate_limits();
create trigger creator_opportunities_progressive_rate_limit
before insert on public.creator_opportunities
for each row execute function private.enforce_signal_action_rate_limits();

revoke all on function private.capture_profile_activity() from public, anon, authenticated;
revoke all on function private.capture_profile_status_activity() from public, anon, authenticated;
revoke all on function private.capture_session_activity() from public, anon, authenticated;
revoke all on function private.capture_registration_activity() from public, anon, authenticated;
revoke all on function private.capture_circle_activity() from public, anon, authenticated;
revoke all on function private.capture_circle_membership_activity() from public, anon, authenticated;
revoke all on function private.capture_commons_activity() from public, anon, authenticated;
revoke all on function private.enforce_signal_action_rate_limits() from public, anon, authenticated;

create or replace function public.update_activity_sharing_preferences(
  p_share_with_friends boolean,
  p_share_session_activity boolean,
  p_share_circle_activity boolean,
  p_share_profile_activity boolean,
  p_share_commons_activity boolean
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

  insert into public.activity_sharing_preferences (
    user_id,
    share_with_friends,
    share_session_activity,
    share_circle_activity,
    share_profile_activity,
    share_commons_activity
  ) values (
    current_user_id,
    p_share_with_friends,
    p_share_session_activity,
    p_share_circle_activity,
    p_share_profile_activity,
    p_share_commons_activity
  )
  on conflict (user_id) do update set
    share_with_friends = excluded.share_with_friends,
    share_session_activity = excluded.share_session_activity,
    share_circle_activity = excluded.share_circle_activity,
    share_profile_activity = excluded.share_profile_activity,
    share_commons_activity = excluded.share_commons_activity;
end;
$$;

revoke all on function public.update_activity_sharing_preferences(
  boolean, boolean, boolean, boolean, boolean
) from public, anon;
grant execute on function public.update_activity_sharing_preferences(
  boolean, boolean, boolean, boolean, boolean
) to authenticated;

create or replace function public.get_friend_activity(
  p_before timestamptz default null,
  p_before_id uuid default null,
  p_limit integer default 20
)
returns table (
  id uuid,
  actor_user_id uuid,
  actor_username text,
  actor_display_name text,
  activity_type public.signal_activity_type,
  entity_type public.signal_activity_entity_type,
  entity_id uuid,
  entity_title text,
  action_url text,
  created_at timestamptz,
  has_more boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with eligible as (
    select
      event.id,
      event.actor_user_id,
      profile.username::text as actor_username,
      coalesce(profile.display_name, profile.username::text) as actor_display_name,
      event.activity_type,
      event.entity_type,
      event.entity_id,
      case event.entity_type
        when 'session' then (select session.title from public.sessions session where session.id = event.entity_id)
        when 'circle' then (select circle.name from public.circles circle where circle.id = event.entity_id)
        when 'opportunity' then (select opportunity.title from public.creator_opportunities opportunity where opportunity.id = event.entity_id)
        else null
      end as entity_title,
      case event.entity_type
        when 'session' then '/home/sessions/' || event.entity_id::text
        when 'circle' then '/home/circles/' || event.entity_id::text
        when 'opportunity' then '/home/commons/' || event.entity_id::text
        else '/home/profiles/' || profile.username::text
      end as action_url,
      event.created_at
    from public.signal_activity_events event
    join public.profiles profile on profile.id = event.actor_user_id
    left join public.activity_sharing_preferences preference
      on preference.user_id = event.actor_user_id
    where auth.uid() is not null
      and event.actor_user_id <> auth.uid()
      and event.created_at >= now() - interval '30 days'
      and (
        p_before is null
        or event.created_at < p_before
        or (
          event.created_at = p_before
          and p_before_id is not null
          and event.id < p_before_id
        )
      )
      and public.profiles_are_friends(auth.uid(), event.actor_user_id)
      and not public.profiles_are_blocked(auth.uid(), event.actor_user_id)
      and not exists (
        select 1 from public.profile_mutes mute
        where mute.muter_id = auth.uid() and mute.muted_id = event.actor_user_id
      )
      and coalesce(preference.share_with_friends, true)
      and case
        when event.activity_type in ('session_created', 'session_joined')
          then coalesce(preference.share_session_activity, true)
        when event.activity_type in ('circle_created', 'circle_joined')
          then coalesce(preference.share_circle_activity, true)
        when event.activity_type = 'commons_created'
          then coalesce(preference.share_commons_activity, false)
        else coalesce(preference.share_profile_activity, true)
      end
      and public.can_view_profile(event.actor_user_id)
      and case event.entity_type
        when 'session' then public.can_view_session(event.entity_id)
          and exists (select 1 from public.sessions session where session.id = event.entity_id and session.status = 'published')
        when 'circle' then public.can_view_circle(event.entity_id)
          and exists (select 1 from public.circles circle where circle.id = event.entity_id and circle.status = 'published')
        when 'opportunity' then public.can_view_creator_opportunity(event.entity_id)
          and exists (select 1 from public.creator_opportunities opportunity where opportunity.id = event.entity_id and opportunity.status = 'published')
        when 'profile' then case event.activity_type
          when 'profile_status_updated' then exists (
            select 1 from public.profile_statuses status
            where status.user_id = event.actor_user_id and status.expires_at > now()
          )
          when 'profile_music_updated' then coalesce(profile.profile_song_title, profile.profile_song_artist, profile.profile_song_url) is not null
          when 'profile_featured_media_updated' then coalesce(profile.featured_profile_image_url, profile.featured_profile_image_2_url) is not null
          when 'profile_recommendation_updated' then coalesce(profile.latest_pick_title, profile.latest_pick_note) is not null
          else false
        end
      end
    order by event.created_at desc, event.id desc
    limit least(greatest(p_limit, 1), 20) + 1
  ), selected as (
    select * from eligible
    limit least(greatest(p_limit, 1), 20)
  )
  select selected.*, (select count(*) from eligible) > least(greatest(p_limit, 1), 20)
  from selected;
$$;

revoke all on function public.get_friend_activity(timestamptz, uuid, integer)
from public, anon;
grant execute on function public.get_friend_activity(timestamptz, uuid, integer)
to authenticated;

alter table public.activity_sharing_preferences enable row level security;
alter table public.signal_activity_events enable row level security;

create policy "activity_sharing_preferences_select_own"
on public.activity_sharing_preferences for select to authenticated
using (user_id = (select auth.uid()));

revoke all on public.activity_sharing_preferences from public, anon, authenticated;
revoke all on public.signal_activity_events from public, anon, authenticated;
grant select on public.activity_sharing_preferences to authenticated;

-- Old windows are operational counters, not permanent behavior history.
create or replace function public.cleanup_signal_rate_limits()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  if not public.has_role('platform_admin') then
    raise exception 'Platform administrator role required' using errcode = '42501';
  end if;
  delete from private.action_rate_limits
  where window_started_at < now() - interval '7 days';
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.cleanup_signal_rate_limits() from public, anon;
grant execute on function public.cleanup_signal_rate_limits() to authenticated;

-- Preserve the concrete entity behind surface-specific reports without changing
-- the existing restricted report workflow or target taxonomy.
alter table public.reports
add column target_entity_id uuid;

create index reports_target_entity_idx
on public.reports (target_type, target_entity_id, created_at desc)
where target_entity_id is not null;

create or replace function public.submit_entity_report(
  p_target_type public.report_target_type,
  p_target_entity_id uuid,
  p_category public.report_category,
  p_summary text,
  p_details text,
  p_context_url text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  report_id uuid;
  target_is_visible boolean := false;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_target_entity_id is not null then
    target_is_visible := case p_target_type
      when 'member' then exists (
        select 1 from public.profiles profile where profile.id = p_target_entity_id
      )
      when 'session' then public.can_view_session(p_target_entity_id)
      when 'circle' then public.can_view_circle(p_target_entity_id)
      when 'opportunity' then public.can_view_creator_opportunity(p_target_entity_id)
      when 'campaign' then public.can_view_realm_campaign(p_target_entity_id)
      when 'platform' then false
      else false
    end;

    if not target_is_visible then
      raise exception 'Reported entity is unavailable' using errcode = '42501';
    end if;
  end if;

  report_id := public.submit_report(
    p_target_type,
    p_category,
    p_summary,
    p_details,
    p_context_url
  );

  update public.reports
  set target_entity_id = p_target_entity_id
  where id = report_id
    and reporter_user_id = auth.uid();

  return report_id;
end;
$$;

revoke all on function public.submit_entity_report(
  public.report_target_type,
  uuid,
  public.report_category,
  text,
  text,
  text
) from public;
grant execute on function public.submit_entity_report(
  public.report_target_type,
  uuid,
  public.report_category,
  text,
  text,
  text
) to authenticated;

comment on table public.signal_activity_events is
  'Finite friend activity references; excludes views, searches, messages, saves, and passive behavior.';
comment on function public.get_friend_activity(timestamptz, uuid, integer) is
  'Friend-only finite activity with source visibility, blocks, mutes, preferences, stale-source checks, and cursor pagination.';
comment on function public.submit_entity_report(
  public.report_target_type,
  uuid,
  public.report_category,
  text,
  text,
  text
) is 'Adds an authorized concrete target to the existing private safety-report workflow.';

create or replace function public.is_safe_external_url(p_value text)
returns boolean
language sql
immutable
security invoker
set search_path = ''
as $$
  select p_value is null or (
    char_length(p_value) <= 500
    and p_value ~* '^https?://'
    and p_value !~* '^https?://[^/]*@'
    and p_value !~* '^https?://(localhost|[^/]+\.local)(:[0-9]+)?(/|$)'
    and p_value !~* '^https?://(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2[0-9]|3[01])\.)([0-9.]*)(:[0-9]+)?(/|$)'
    and p_value !~* '^https?://\[?::1\]?(:[0-9]+)?(/|$)'
  );
$$;

revoke all on function public.is_safe_external_url(text) from public, anon;
grant execute on function public.is_safe_external_url(text) to authenticated;

create or replace function private.validate_profile_external_urls()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_safe_external_url(new.spotlight_url)
     or not public.is_safe_external_url(new.view_my_url)
     or not public.is_safe_external_url(new.profile_song_url)
     or not public.is_safe_external_url(new.latest_pick_url)
     or not public.is_safe_external_url(new.current_game_url)
     or not public.is_safe_external_url(new.current_reading_url)
     or not public.is_safe_external_url(new.current_food_url) then
    raise exception 'Unsafe external URL' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger profiles_validate_external_urls
before insert or update of spotlight_url, view_my_url, profile_song_url,
  latest_pick_url, current_game_url, current_reading_url, current_food_url
on public.profiles
for each row execute function private.validate_profile_external_urls();

revoke all on function private.validate_profile_external_urls()
from public, anon, authenticated;
