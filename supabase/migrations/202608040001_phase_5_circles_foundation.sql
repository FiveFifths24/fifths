-- Phase 5: Circle discovery, membership, local roles, Session associations,
-- and basic membership moderation. Reports, messaging, feeds, organizations,
-- Commons, Realm, and Passport issuance remain later-phase work.

create type public.circle_visibility as enum ('public', 'private');
create type public.circle_join_policy as enum ('open', 'request', 'invite_only');
create type public.circle_status as enum ('draft', 'published', 'archived');
create type public.circle_member_role as enum ('owner', 'host', 'moderator', 'member');
create type public.circle_membership_status as enum (
  'requested',
  'invited',
  'active',
  'declined',
  'removed',
  'left'
);

create table public.circles (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles (id) on delete restrict,
  name text not null,
  slug extensions.citext not null unique,
  summary text not null,
  description text not null,
  rules text not null,
  status public.circle_status not null default 'draft',
  visibility public.circle_visibility not null default 'public',
  join_policy public.circle_join_policy not null default 'request',
  format public.participation_format not null,
  location_label text,
  mode_id uuid not null references public.modes (id) on delete restrict,
  minimum_energy smallint not null,
  maximum_energy smallint not null,
  stimulation_level public.pulse_stimulation_level not null,
  social_intensity public.pulse_social_intensity not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint circles_name_length check (char_length(btrim(name)) between 3 and 80),
  constraint circles_slug_format check (
    slug::text ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and char_length(slug::text) between 3 and 60
  ),
  constraint circles_summary_length check (
    char_length(btrim(summary)) between 10 and 240
  ),
  constraint circles_description_length check (
    char_length(btrim(description)) between 20 and 4000
  ),
  constraint circles_rules_length check (
    char_length(btrim(rules)) between 20 and 4000
  ),
  constraint circles_location_label_length check (
    location_label is null
    or char_length(btrim(location_label)) between 2 and 120
  ),
  constraint circles_energy_range check (
    minimum_energy between 1 and 5
    and maximum_energy between 1 and 5
    and minimum_energy <= maximum_energy
  ),
  constraint circles_private_join_policy check (
    visibility = 'public' or join_policy = 'invite_only'
  ),
  constraint circles_publication_state check (
    (status = 'draft' and published_at is null)
    or status = 'archived'
    or (status = 'published' and published_at is not null)
  )
);

create trigger circles_set_updated_at
before update on public.circles
for each row execute function public.set_updated_at();

create table public.circle_interests (
  circle_id uuid not null references public.circles (id) on delete cascade,
  interest_id uuid not null references public.interests (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (circle_id, interest_id)
);

create table public.circle_members (
  circle_id uuid not null references public.circles (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.circle_member_role not null default 'member',
  status public.circle_membership_status not null,
  requested_at timestamptz,
  invited_by uuid references auth.users (id) on delete set null,
  joined_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (circle_id, user_id),
  constraint circle_members_lifecycle check (
    (status = 'active' and joined_at is not null and ended_at is null)
    or (status in ('requested', 'invited') and joined_at is null and ended_at is null)
    or (status in ('declined', 'removed', 'left') and ended_at is not null)
  ),
  constraint circle_members_owner_active check (
    role <> 'owner' or status = 'active'
  )
);

create trigger circle_members_set_updated_at
before update on public.circle_members
for each row execute function public.set_updated_at();

alter table public.sessions
add column circle_id uuid references public.circles (id) on delete set null;

alter table public.sessions
add constraint sessions_circle_source_consistency check (
  (circle_id is null and source_module <> 'circles')
  or (circle_id is not null and source_module = 'circles')
);

create table private.circle_membership_audit_logs (
  id bigint generated always as identity primary key,
  circle_id uuid not null,
  target_user_id uuid not null,
  previous_status public.circle_membership_status,
  new_status public.circle_membership_status not null,
  previous_role public.circle_member_role,
  new_role public.circle_member_role not null,
  actor_user_id uuid,
  occurred_at timestamptz not null default now()
);

revoke all on private.circle_membership_audit_logs from public, anon, authenticated;

create or replace function private.audit_circle_membership_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.circle_membership_audit_logs (
    circle_id,
    target_user_id,
    previous_status,
    new_status,
    previous_role,
    new_role,
    actor_user_id
  ) values (
    new.circle_id,
    new.user_id,
    case when tg_op = 'UPDATE' then old.status else null end,
    new.status,
    case when tg_op = 'UPDATE' then old.role else null end,
    new.role,
    auth.uid()
  );
  return new;
end;
$$;

create trigger circle_membership_audit_change
after insert or update on public.circle_members
for each row execute function private.audit_circle_membership_change();

revoke all on function private.audit_circle_membership_change() from public;

create index circles_discovery_idx
on public.circles (status, visibility, name, id);

create index circles_mode_idx
on public.circles (mode_id, status);

create index circle_interests_interest_idx
on public.circle_interests (interest_id, circle_id);

create index circle_members_user_idx
on public.circle_members (user_id, status, updated_at desc);

create index circle_members_queue_idx
on public.circle_members (circle_id, status, role);

create index sessions_circle_idx
on public.sessions (circle_id, status, starts_at);

create or replace function public.is_circle_member(p_circle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.circle_members
    where circle_id = p_circle_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.can_manage_circle(p_circle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.circle_members
    where circle_id = p_circle_id
      and user_id = auth.uid()
      and status = 'active'
      and role = 'owner'
  ) or public.has_role('platform_admin');
$$;

create or replace function public.can_moderate_circle(p_circle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.circle_members
    where circle_id = p_circle_id
      and user_id = auth.uid()
      and status = 'active'
      and role in ('owner', 'moderator')
  ) or public.has_role('moderator') or public.has_role('platform_admin');
$$;

create or replace function public.can_host_circle(p_circle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.circle_members
    where circle_id = p_circle_id
      and user_id = auth.uid()
      and status = 'active'
      and role in ('owner', 'host')
  ) or public.has_role('platform_admin');
$$;

create or replace function public.can_view_circle(p_circle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.circles
    where id = p_circle_id
      and status = 'published'
      and visibility = 'public'
  ) or exists (
    select 1
    from public.circle_members
    join public.circles on circles.id = circle_members.circle_id
    where circle_id = p_circle_id
      and user_id = auth.uid()
      and (
        circle_members.status = 'active'
        or (
          circle_members.status in ('invited', 'requested')
          and circles.status = 'published'
        )
      )
  ) or public.can_manage_circle(p_circle_id)
    or public.can_moderate_circle(p_circle_id);
$$;

revoke all on function public.is_circle_member(uuid) from public;
revoke all on function public.can_manage_circle(uuid) from public;
revoke all on function public.can_moderate_circle(uuid) from public;
revoke all on function public.can_host_circle(uuid) from public;
revoke all on function public.can_view_circle(uuid) from public;

grant execute on function public.is_circle_member(uuid) to authenticated;
grant execute on function public.can_manage_circle(uuid) to authenticated;
grant execute on function public.can_moderate_circle(uuid) to authenticated;
grant execute on function public.can_host_circle(uuid) to authenticated;
grant execute on function public.can_view_circle(uuid) to authenticated;

create or replace function public.create_circle(
  p_name text,
  p_slug text,
  p_summary text,
  p_description text,
  p_rules text,
  p_visibility public.circle_visibility,
  p_join_policy public.circle_join_policy,
  p_format public.participation_format,
  p_location_label text,
  p_mode_id uuid,
  p_minimum_energy integer,
  p_maximum_energy integer,
  p_stimulation_level public.pulse_stimulation_level,
  p_social_intensity public.pulse_social_intensity,
  p_interest_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  circle_id uuid := gen_random_uuid();
  normalized_slug text := lower(btrim(p_slug));
  requested_interest_count integer;
  active_interest_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not (public.has_role('host') or public.has_role('platform_admin')) then
    raise exception 'Host role required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = current_user_id and onboarding_completed_at is not null
  ) then
    raise exception 'Onboarding required' using errcode = '42501';
  end if;

  if char_length(btrim(p_name)) not between 3 and 80
     or normalized_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
     or char_length(normalized_slug) not between 3 and 60
     or char_length(btrim(p_summary)) not between 10 and 240
     or char_length(btrim(p_description)) not between 20 and 4000
     or char_length(btrim(p_rules)) not between 20 and 4000 then
    raise exception 'Invalid Circle content' using errcode = '22023';
  end if;

  if p_visibility = 'private' and p_join_policy <> 'invite_only' then
    raise exception 'Private Circles are invite only' using errcode = '22023';
  end if;

  if p_location_label is not null
     and char_length(btrim(p_location_label)) not between 2 and 120 then
    raise exception 'Invalid location label' using errcode = '22023';
  end if;

  if p_mode_id is null or not exists (
    select 1 from public.modes where id = p_mode_id and active
  ) then
    raise exception 'Invalid mode' using errcode = '22023';
  end if;

  if p_minimum_energy not between 1 and 5
     or p_maximum_energy not between 1 and 5
     or p_minimum_energy > p_maximum_energy then
    raise exception 'Invalid Circle energy range' using errcode = '22023';
  end if;

  if cardinality(coalesce(p_interest_ids, '{}'::uuid[])) > 8 then
    raise exception 'Invalid interest selection' using errcode = '22023';
  end if;

  select count(distinct id) into requested_interest_count
  from unnest(coalesce(p_interest_ids, '{}'::uuid[])) as selected(id);

  if cardinality(coalesce(p_interest_ids, '{}'::uuid[])) <> requested_interest_count then
    raise exception 'Invalid interest selection' using errcode = '22023';
  end if;

  select count(*) into active_interest_count
  from public.interests
  where active and id = any(coalesce(p_interest_ids, '{}'::uuid[]));

  if requested_interest_count <> active_interest_count then
    raise exception 'Invalid interest selection' using errcode = '22023';
  end if;

  insert into public.circles (
    id,
    created_by,
    name,
    slug,
    summary,
    description,
    rules,
    visibility,
    join_policy,
    format,
    location_label,
    mode_id,
    minimum_energy,
    maximum_energy,
    stimulation_level,
    social_intensity
  ) values (
    circle_id,
    current_user_id,
    btrim(p_name),
    normalized_slug,
    btrim(p_summary),
    btrim(p_description),
    btrim(p_rules),
    p_visibility,
    p_join_policy,
    p_format,
    nullif(btrim(p_location_label), ''),
    p_mode_id,
    p_minimum_energy,
    p_maximum_energy,
    p_stimulation_level,
    p_social_intensity
  );

  insert into public.circle_interests (circle_id, interest_id)
  select circle_id, id
  from unnest(coalesce(p_interest_ids, '{}'::uuid[])) as selected(id);

  insert into public.circle_members (
    circle_id,
    user_id,
    role,
    status,
    joined_at
  ) values (
    circle_id,
    current_user_id,
    'owner',
    'active',
    now()
  );

  return circle_id;
end;
$$;

create or replace function public.set_circle_status(
  p_circle_id uuid,
  p_status public.circle_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_circle public.circles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into current_circle
  from public.circles
  where id = p_circle_id
  for update;

  if not found or not public.can_manage_circle(p_circle_id) then
    raise exception 'Circle management denied' using errcode = '42501';
  end if;

  if p_status = 'published' and current_circle.status = 'draft' then
    update public.circles
    set status = 'published', published_at = now()
    where id = p_circle_id;
  elsif p_status = 'archived'
        and current_circle.status in ('draft', 'published')
        and not exists (
          select 1 from public.sessions
          where circle_id = p_circle_id
            and status = 'published'
            and starts_at > now()
        ) then
    update public.circles
    set status = 'archived'
    where id = p_circle_id;
  else
    raise exception 'Invalid Circle status transition' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.join_circle(p_circle_id uuid)
returns public.circle_membership_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_circle public.circles%rowtype;
  existing_membership public.circle_members%rowtype;
  new_status public.circle_membership_status;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = current_user_id and onboarding_completed_at is not null
  ) then
    raise exception 'Onboarding required' using errcode = '42501';
  end if;

  select * into current_circle
  from public.circles
  where id = p_circle_id
  for update;

  if not found
     or current_circle.status <> 'published'
     or current_circle.visibility <> 'public'
     or current_circle.join_policy = 'invite_only' then
    raise exception 'Circle is not open to joins' using errcode = '22023';
  end if;

  select * into existing_membership
  from public.circle_members
  where circle_id = p_circle_id and user_id = current_user_id
  for update;

  if existing_membership.status in ('active', 'requested') then
    return existing_membership.status;
  end if;

  if existing_membership.status = 'invited' then
    new_status := 'active';
  elsif current_circle.join_policy = 'open' then
    new_status := 'active';
  else
    new_status := 'requested';
  end if;

  insert into public.circle_members (
    circle_id,
    user_id,
    role,
    status,
    requested_at,
    joined_at,
    ended_at,
    invited_by
  ) values (
    p_circle_id,
    current_user_id,
    'member',
    new_status,
    case when new_status = 'requested' then now() else null end,
    case when new_status = 'active' then now() else null end,
    null,
    null
  )
  on conflict (circle_id, user_id) do update
  set
    role = 'member',
    status = excluded.status,
    requested_at = excluded.requested_at,
    joined_at = excluded.joined_at,
    ended_at = null,
    invited_by = null;

  return new_status;
end;
$$;

create or replace function public.respond_to_circle_invitation(
  p_circle_id uuid,
  p_accept boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  update public.circle_members
  set
    status = case when p_accept then 'active' else 'declined' end,
    joined_at = case when p_accept then now() else null end,
    ended_at = case when p_accept then null else now() end
  where circle_id = p_circle_id
    and user_id = auth.uid()
    and status = 'invited';

  if not found then
    raise exception 'Circle invitation not found' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.leave_circle(p_circle_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  update public.circle_members
  set status = 'left', ended_at = now()
  where circle_id = p_circle_id
    and user_id = auth.uid()
    and status = 'active'
    and role <> 'owner';

  if not found then
    raise exception 'Active non-owner membership required' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.invite_circle_member(
  p_circle_id uuid,
  p_username text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
  existing_membership public.circle_members%rowtype;
begin
  if auth.uid() is null or not (
    exists (
      select 1 from public.circle_members
      where circle_id = p_circle_id
        and user_id = auth.uid()
        and status = 'active'
        and role in ('owner', 'moderator')
    )
    or public.has_role('platform_admin')
  ) then
    raise exception 'Circle moderation denied' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.circles
    where id = p_circle_id and status in ('draft', 'published')
  ) then
    raise exception 'Circle is not accepting invitations' using errcode = '22023';
  end if;

  select id into target_user_id
  from public.profiles
  where username = lower(btrim(p_username))
    and onboarding_completed_at is not null;

  if target_user_id is null or target_user_id = auth.uid() then
    raise exception 'Eligible member not found' using errcode = '22023';
  end if;

  select * into existing_membership
  from public.circle_members
  where circle_id = p_circle_id and user_id = target_user_id
  for update;

  if existing_membership.status = 'active' then
    return;
  end if;

  insert into public.circle_members (
    circle_id,
    user_id,
    role,
    status,
    invited_by,
    joined_at,
    ended_at
  ) values (
    p_circle_id,
    target_user_id,
    'member',
    'invited',
    auth.uid(),
    null,
    null
  )
  on conflict (circle_id, user_id) do update
  set
    role = 'member',
    status = 'invited',
    invited_by = auth.uid(),
    requested_at = null,
    joined_at = null,
    ended_at = null;
end;
$$;

create or replace function public.review_circle_membership(
  p_circle_id uuid,
  p_user_id uuid,
  p_decision text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_membership public.circle_members%rowtype;
  is_local_moderator boolean;
  is_platform_admin boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select exists (
    select 1 from public.circle_members
    where circle_id = p_circle_id
      and user_id = auth.uid()
      and status = 'active'
      and role in ('owner', 'moderator')
  ) into is_local_moderator;
  is_platform_admin := public.has_role('platform_admin');

  if not is_local_moderator
     and not is_platform_admin
     and not (public.has_role('moderator') and p_decision = 'remove') then
    raise exception 'Circle moderation denied' using errcode = '42501';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'Use the member self-service action' using errcode = '22023';
  end if;

  select * into target_membership
  from public.circle_members
  where circle_id = p_circle_id and user_id = p_user_id
  for update;

  if not found or target_membership.role = 'owner' then
    raise exception 'Membership change denied' using errcode = '42501';
  end if;

  if target_membership.role in ('host', 'moderator')
     and not public.can_manage_circle(p_circle_id) then
    raise exception 'Circle owner required' using errcode = '42501';
  end if;

  if p_decision = 'approve' and target_membership.status = 'requested' then
    update public.circle_members
    set status = 'active', joined_at = now(), ended_at = null
    where circle_id = p_circle_id and user_id = p_user_id;
  elsif p_decision = 'decline' and target_membership.status = 'requested' then
    update public.circle_members
    set status = 'declined', ended_at = now()
    where circle_id = p_circle_id and user_id = p_user_id;
  elsif p_decision = 'remove' and target_membership.status = 'active' then
    update public.circle_members
    set status = 'removed', ended_at = now()
    where circle_id = p_circle_id and user_id = p_user_id;
  else
    raise exception 'Invalid membership transition' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.set_circle_member_role(
  p_circle_id uuid,
  p_user_id uuid,
  p_role public.circle_member_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.can_manage_circle(p_circle_id) then
    raise exception 'Circle owner required' using errcode = '42501';
  end if;

  if p_role = 'owner' or p_user_id = auth.uid() then
    raise exception 'Ownership transfer is not available' using errcode = '22023';
  end if;

  update public.circle_members
  set role = p_role
  where circle_id = p_circle_id
    and user_id = p_user_id
    and status = 'active'
    and role <> 'owner';

  if not found then
    raise exception 'Active member not found' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.get_circle_roster(p_circle_id uuid)
returns table (
  user_id uuid,
  display_name text,
  username text,
  membership_status public.circle_membership_status,
  member_role public.circle_member_role,
  requested_at timestamptz,
  joined_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.can_moderate_circle(p_circle_id) then
    raise exception 'Circle roster denied' using errcode = '42501';
  end if;

  return query
  select
    circle_members.user_id,
    coalesce(profiles.display_name, profiles.username::text, 'Member'),
    profiles.username::text,
    circle_members.status,
    circle_members.role,
    circle_members.requested_at,
    circle_members.joined_at
  from public.circle_members
  join public.profiles on profiles.id = circle_members.user_id
  where circle_members.circle_id = p_circle_id
    and circle_members.status in ('requested', 'active')
  order by
    case when circle_members.status = 'requested' then 0 else 1 end,
    coalesce(profiles.display_name, profiles.username::text, 'Member');
end;
$$;

create or replace function public.set_session_circle(
  p_session_id uuid,
  p_circle_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_session public.sessions%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into current_session
  from public.sessions
  where id = p_session_id
  for update;

  if not found
     or not public.can_manage_session(p_session_id)
     or current_session.status <> 'draft' then
    raise exception 'Draft Session management required' using errcode = '42501';
  end if;

  if p_circle_id is null then
    update public.sessions
    set circle_id = null, source_module = 'platform'
    where id = p_session_id;
    return;
  end if;

  if not public.can_host_circle(p_circle_id) or not exists (
    select 1 from public.circles
    where id = p_circle_id and status in ('draft', 'published')
  ) then
    raise exception 'Circle hosting denied' using errcode = '42501';
  end if;

  update public.sessions
  set circle_id = p_circle_id, source_module = 'circles'
  where id = p_session_id;
end;
$$;

-- Published Sessions associated with private Circles are visible only to active
-- Circle members, while registrations and Session managers keep lifecycle access.
create or replace function public.can_view_session(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.sessions
    left join public.circles on circles.id = sessions.circle_id
    where sessions.id = p_session_id
      and sessions.status = 'published'
      and (
        sessions.circle_id is null
        or (
          circles.status = 'published'
          and (
            circles.visibility = 'public'
            or public.is_circle_member(sessions.circle_id)
          )
        )
      )
  ) or public.can_manage_session(p_session_id) or exists (
    select 1
    from public.registrations
    where session_id = p_session_id
      and user_id = auth.uid()
  );
$$;

revoke all on function public.create_circle(
  text,
  text,
  text,
  text,
  text,
  public.circle_visibility,
  public.circle_join_policy,
  public.participation_format,
  text,
  uuid,
  integer,
  integer,
  public.pulse_stimulation_level,
  public.pulse_social_intensity,
  uuid[]
) from public;
revoke all on function public.set_circle_status(uuid, public.circle_status) from public;
revoke all on function public.join_circle(uuid) from public;
revoke all on function public.respond_to_circle_invitation(uuid, boolean) from public;
revoke all on function public.leave_circle(uuid) from public;
revoke all on function public.invite_circle_member(uuid, text) from public;
revoke all on function public.review_circle_membership(uuid, uuid, text) from public;
revoke all on function public.set_circle_member_role(
  uuid,
  uuid,
  public.circle_member_role
) from public;
revoke all on function public.get_circle_roster(uuid) from public;
revoke all on function public.set_session_circle(uuid, uuid) from public;

grant execute on function public.create_circle(
  text,
  text,
  text,
  text,
  text,
  public.circle_visibility,
  public.circle_join_policy,
  public.participation_format,
  text,
  uuid,
  integer,
  integer,
  public.pulse_stimulation_level,
  public.pulse_social_intensity,
  uuid[]
) to authenticated;
grant execute on function public.set_circle_status(uuid, public.circle_status) to authenticated;
grant execute on function public.join_circle(uuid) to authenticated;
grant execute on function public.respond_to_circle_invitation(uuid, boolean) to authenticated;
grant execute on function public.leave_circle(uuid) to authenticated;
grant execute on function public.invite_circle_member(uuid, text) to authenticated;
grant execute on function public.review_circle_membership(uuid, uuid, text) to authenticated;
grant execute on function public.set_circle_member_role(
  uuid,
  uuid,
  public.circle_member_role
) to authenticated;
grant execute on function public.get_circle_roster(uuid) to authenticated;
grant execute on function public.set_session_circle(uuid, uuid) to authenticated;

alter table public.circles enable row level security;
alter table public.circle_interests enable row level security;
alter table public.circle_members enable row level security;

create policy "circles_select_eligible"
on public.circles for select
to authenticated
using (public.can_view_circle(id));

create policy "circle_interests_select_eligible"
on public.circle_interests for select
to authenticated
using (public.can_view_circle(circle_id));

create policy "circle_members_select_own_or_moderator"
on public.circle_members for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.can_moderate_circle(circle_id)
);

revoke all on public.circles from anon, authenticated;
revoke all on public.circle_interests from anon, authenticated;
revoke all on public.circle_members from anon, authenticated;

grant usage on type
  public.circle_visibility,
  public.circle_join_policy,
  public.circle_status,
  public.circle_member_role,
  public.circle_membership_status
to authenticated;

grant select on public.circles to authenticated;
grant select on public.circle_interests to authenticated;
grant select on public.circle_members to authenticated;
