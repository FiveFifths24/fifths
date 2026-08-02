-- Phase 4: shared Sessions, capacity-safe registration, and attendance foundation.
-- Circle membership, Commons workflows, Realm campaigns, and Passport issuance begin later.

create type public.session_source_module as enum (
  'platform',
  'circles',
  'commons',
  'realm'
);
create type public.session_status as enum (
  'draft',
  'published',
  'cancelled',
  'completed'
);
create type public.registration_status as enum ('registered', 'cancelled');
create type public.attendance_status as enum ('attended', 'absent', 'excused');

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  host_user_id uuid not null references public.profiles (id) on delete restrict,
  host_display_name text not null,
  source_module public.session_source_module not null default 'platform',
  title text not null,
  summary text not null,
  description text not null,
  status public.session_status not null default 'draft',
  format public.participation_format not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null,
  capacity integer not null,
  confirmed_registration_count integer not null default 0,
  location_label text,
  mode_id uuid not null references public.modes (id) on delete restrict,
  minimum_energy smallint not null,
  maximum_energy smallint not null,
  stimulation_level public.pulse_stimulation_level not null,
  social_intensity public.pulse_social_intensity not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sessions_title_length check (char_length(btrim(title)) between 3 and 100),
  constraint sessions_summary_length check (char_length(btrim(summary)) between 10 and 240),
  constraint sessions_description_length check (
    char_length(btrim(description)) between 20 and 4000
  ),
  constraint sessions_host_display_name_length check (
    char_length(btrim(host_display_name)) between 1 and 80
  ),
  constraint sessions_time_order check (
    ends_at > starts_at and ends_at <= starts_at + interval '12 hours'
  ),
  constraint sessions_timezone_allowed check (
    timezone in (
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Phoenix',
      'America/Los_Angeles'
    )
  ),
  constraint sessions_capacity_range check (capacity between 1 and 100),
  constraint sessions_registration_count_range check (
    confirmed_registration_count between 0 and capacity
  ),
  constraint sessions_location_label_length check (
    location_label is null or char_length(btrim(location_label)) between 2 and 120
  ),
  constraint sessions_energy_range check (
    minimum_energy between 1 and 5
    and maximum_energy between 1 and 5
    and minimum_energy <= maximum_energy
  ),
  constraint sessions_publication_time check (
    (status = 'draft' and published_at is null)
    or status = 'cancelled'
    or (status in ('published', 'completed') and published_at is not null)
  )
);

create trigger sessions_set_updated_at
before update on public.sessions
for each row execute function public.set_updated_at();

create table public.session_interests (
  session_id uuid not null references public.sessions (id) on delete cascade,
  interest_id uuid not null references public.interests (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (session_id, interest_id)
);

create table public.registrations (
  session_id uuid not null references public.sessions (id) on delete restrict,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.registration_status not null default 'registered',
  registered_at timestamptz not null default now(),
  cancelled_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (session_id, user_id),
  constraint registrations_cancellation_state check (
    (status = 'registered' and cancelled_at is null)
    or (status = 'cancelled' and cancelled_at is not null)
  )
);

create trigger registrations_set_updated_at
before update on public.registrations
for each row execute function public.set_updated_at();

create table public.attendance_records (
  session_id uuid not null,
  user_id uuid not null,
  status public.attendance_status not null,
  marked_by uuid not null references auth.users (id) on delete restrict,
  marked_at timestamptz not null default now(),
  primary key (session_id, user_id),
  foreign key (session_id, user_id)
    references public.registrations (session_id, user_id)
    on delete cascade
);

create table private.session_attendance_audit_logs (
  id bigint generated always as identity primary key,
  session_id uuid not null,
  user_id uuid not null,
  previous_status public.attendance_status,
  new_status public.attendance_status not null,
  actor_user_id uuid,
  occurred_at timestamptz not null default now()
);

revoke all on private.session_attendance_audit_logs from public, anon, authenticated;

create or replace function private.audit_session_attendance_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.session_attendance_audit_logs (
    session_id,
    user_id,
    previous_status,
    new_status,
    actor_user_id
  ) values (
    new.session_id,
    new.user_id,
    case when tg_op = 'UPDATE' then old.status else null end,
    new.status,
    auth.uid()
  );
  return new;
end;
$$;

create trigger session_attendance_audit_change
after insert or update on public.attendance_records
for each row execute function private.audit_session_attendance_change();

revoke all on function private.audit_session_attendance_change() from public;

create index sessions_discovery_idx
on public.sessions (status, starts_at, id);

create index sessions_host_idx
on public.sessions (host_user_id, starts_at desc);

create index session_interests_interest_idx
on public.session_interests (interest_id, session_id);

create index registrations_user_idx
on public.registrations (user_id, status, registered_at desc);

create or replace function public.can_manage_session(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.sessions
    join public.user_roles
      on user_roles.user_id = auth.uid()
      and user_roles.role = 'host'
    where sessions.id = p_session_id
      and sessions.host_user_id = auth.uid()
  ) or exists (
    select 1
    from public.user_roles
    where user_id = auth.uid() and role = 'platform_admin'
  );
$$;

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
    where id = p_session_id and status = 'published'
  ) or public.can_manage_session(p_session_id) or exists (
    select 1
    from public.registrations
    where session_id = p_session_id
      and user_id = auth.uid()
  );
$$;

revoke all on function public.can_manage_session(uuid) from public;
revoke all on function public.can_view_session(uuid) from public;
grant execute on function public.can_manage_session(uuid) to authenticated;
grant execute on function public.can_view_session(uuid) to authenticated;

create or replace function public.create_session(
  p_title text,
  p_summary text,
  p_description text,
  p_format public.participation_format,
  p_starts_local timestamp,
  p_ends_local timestamp,
  p_timezone text,
  p_capacity integer,
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
  session_id uuid := gen_random_uuid();
  host_name text;
  starts_at_utc timestamptz;
  ends_at_utc timestamptz;
  requested_interest_count integer;
  active_interest_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not (
    public.has_role('host') or public.has_role('platform_admin')
  ) then
    raise exception 'Host role required' using errcode = '42501';
  end if;

  select coalesce(nullif(btrim(display_name), ''), username::text)
  into host_name
  from public.profiles
  where id = current_user_id and onboarding_completed_at is not null;

  if host_name is null then
    raise exception 'Onboarding required' using errcode = '42501';
  end if;

  if char_length(btrim(p_title)) not between 3 and 100
     or char_length(btrim(p_summary)) not between 10 and 240
     or char_length(btrim(p_description)) not between 20 and 4000 then
    raise exception 'Invalid session content' using errcode = '22023';
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

  starts_at_utc := p_starts_local at time zone p_timezone;
  ends_at_utc := p_ends_local at time zone p_timezone;

  if starts_at_utc <= now()
     or ends_at_utc <= starts_at_utc
     or ends_at_utc > starts_at_utc + interval '12 hours' then
    raise exception 'Invalid session time' using errcode = '22023';
  end if;

  if p_capacity not between 1 and 100
     or p_minimum_energy not between 1 and 5
     or p_maximum_energy not between 1 and 5
     or p_minimum_energy > p_maximum_energy then
    raise exception 'Invalid session matching range' using errcode = '22023';
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

  insert into public.sessions (
    id,
    host_user_id,
    host_display_name,
    title,
    summary,
    description,
    format,
    starts_at,
    ends_at,
    timezone,
    capacity,
    location_label,
    mode_id,
    minimum_energy,
    maximum_energy,
    stimulation_level,
    social_intensity
  ) values (
    session_id,
    current_user_id,
    host_name,
    btrim(p_title),
    btrim(p_summary),
    btrim(p_description),
    p_format,
    starts_at_utc,
    ends_at_utc,
    p_timezone,
    p_capacity,
    nullif(btrim(p_location_label), ''),
    p_mode_id,
    p_minimum_energy,
    p_maximum_energy,
    p_stimulation_level,
    p_social_intensity
  );

  insert into public.session_interests (session_id, interest_id)
  select session_id, id
  from unnest(coalesce(p_interest_ids, '{}'::uuid[])) as selected(id);

  return session_id;
end;
$$;

create or replace function public.set_session_status(
  p_session_id uuid,
  p_status public.session_status
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

  if not found or not public.can_manage_session(p_session_id) then
    raise exception 'Session management denied' using errcode = '42501';
  end if;

  if p_status = 'published'
     and current_session.status = 'draft'
     and current_session.starts_at > now() then
    update public.sessions
    set status = 'published', published_at = now()
    where id = p_session_id;
  elsif p_status = 'cancelled'
        and current_session.status in ('draft', 'published') then
    update public.sessions
    set status = 'cancelled'
    where id = p_session_id;
  elsif p_status = 'completed'
        and current_session.status = 'published'
        and current_session.ends_at <= now() then
    update public.sessions
    set status = 'completed'
    where id = p_session_id;
  else
    raise exception 'Invalid session status transition' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.register_for_session(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_session public.sessions%rowtype;
  previous_status public.registration_status;
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

  select * into current_session
  from public.sessions
  where id = p_session_id
  for update;

  if not found
     or current_session.status <> 'published'
     or current_session.starts_at <= now() then
    raise exception 'Session is not open for registration' using errcode = '22023';
  end if;

  select status into previous_status
  from public.registrations
  where session_id = p_session_id and user_id = current_user_id
  for update;

  if previous_status = 'registered' then
    return;
  end if;

  if current_session.confirmed_registration_count >= current_session.capacity then
    raise exception 'Session is full' using errcode = 'P0001';
  end if;

  insert into public.registrations (
    session_id,
    user_id,
    status,
    registered_at,
    cancelled_at
  ) values (
    p_session_id,
    current_user_id,
    'registered',
    now(),
    null
  )
  on conflict (session_id, user_id) do update
  set
    status = 'registered',
    registered_at = now(),
    cancelled_at = null;

  update public.sessions
  set confirmed_registration_count = confirmed_registration_count + 1
  where id = p_session_id;
end;
$$;

create or replace function public.cancel_session_registration(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_session public.sessions%rowtype;
  current_registration public.registrations%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into current_session
  from public.sessions
  where id = p_session_id
  for update;

  select * into current_registration
  from public.registrations
  where session_id = p_session_id and user_id = current_user_id
  for update;

  if current_session.id is null
     or current_session.starts_at <= now()
     or current_registration.session_id is null
     or current_registration.status <> 'registered' then
    raise exception 'Registration cannot be cancelled' using errcode = '22023';
  end if;

  update public.registrations
  set status = 'cancelled', cancelled_at = now()
  where session_id = p_session_id and user_id = current_user_id;

  update public.sessions
  set confirmed_registration_count = greatest(confirmed_registration_count - 1, 0)
  where id = p_session_id;
end;
$$;

create or replace function public.mark_session_attendance(
  p_session_id uuid,
  p_user_id uuid,
  p_status public.attendance_status
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
  where id = p_session_id;

  if current_session.id is null
     or not public.can_manage_session(p_session_id)
     or current_session.status not in ('published', 'completed')
     or current_session.starts_at > now() then
    raise exception 'Attendance management denied' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.registrations
    where session_id = p_session_id
      and user_id = p_user_id
      and status = 'registered'
  ) then
    raise exception 'Active registration required' using errcode = '22023';
  end if;

  insert into public.attendance_records (
    session_id,
    user_id,
    status,
    marked_by,
    marked_at
  ) values (
    p_session_id,
    p_user_id,
    p_status,
    auth.uid(),
    now()
  )
  on conflict (session_id, user_id) do update
  set status = excluded.status, marked_by = auth.uid(), marked_at = now();
end;
$$;

create or replace function public.get_session_roster(p_session_id uuid)
returns table (
  user_id uuid,
  display_name text,
  username text,
  registration_status public.registration_status,
  attendance_status public.attendance_status
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.can_manage_session(p_session_id) then
    raise exception 'Session roster denied' using errcode = '42501';
  end if;

  return query
  select
    registrations.user_id,
    coalesce(profiles.display_name, profiles.username::text, 'Member'),
    profiles.username::text,
    registrations.status,
    attendance_records.status
  from public.registrations
  join public.profiles on profiles.id = registrations.user_id
  left join public.attendance_records
    on attendance_records.session_id = registrations.session_id
    and attendance_records.user_id = registrations.user_id
  where registrations.session_id = p_session_id
    and registrations.status = 'registered'
  order by coalesce(profiles.display_name, profiles.username::text, 'Member');
end;
$$;

revoke all on function public.create_session(
  text,
  text,
  text,
  public.participation_format,
  timestamp,
  timestamp,
  text,
  integer,
  text,
  uuid,
  integer,
  integer,
  public.pulse_stimulation_level,
  public.pulse_social_intensity,
  uuid[]
) from public;
revoke all on function public.set_session_status(uuid, public.session_status) from public;
revoke all on function public.register_for_session(uuid) from public;
revoke all on function public.cancel_session_registration(uuid) from public;
revoke all on function public.mark_session_attendance(
  uuid,
  uuid,
  public.attendance_status
) from public;
revoke all on function public.get_session_roster(uuid) from public;

grant execute on function public.create_session(
  text,
  text,
  text,
  public.participation_format,
  timestamp,
  timestamp,
  text,
  integer,
  text,
  uuid,
  integer,
  integer,
  public.pulse_stimulation_level,
  public.pulse_social_intensity,
  uuid[]
) to authenticated;
grant execute on function public.set_session_status(uuid, public.session_status) to authenticated;
grant execute on function public.register_for_session(uuid) to authenticated;
grant execute on function public.cancel_session_registration(uuid) to authenticated;
grant execute on function public.mark_session_attendance(
  uuid,
  uuid,
  public.attendance_status
) to authenticated;
grant execute on function public.get_session_roster(uuid) to authenticated;

alter table public.sessions enable row level security;
alter table public.session_interests enable row level security;
alter table public.registrations enable row level security;
alter table public.attendance_records enable row level security;

create policy "sessions_select_eligible"
on public.sessions for select
to authenticated
using (public.can_view_session(id));

create policy "session_interests_select_eligible"
on public.session_interests for select
to authenticated
using (public.can_view_session(session_id));

create policy "registrations_select_own_or_manager"
on public.registrations for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.can_manage_session(session_id)
);

create policy "attendance_select_own_or_manager"
on public.attendance_records for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.can_manage_session(session_id)
);

revoke all on public.sessions from anon, authenticated;
revoke all on public.session_interests from anon, authenticated;
revoke all on public.registrations from anon, authenticated;
revoke all on public.attendance_records from anon, authenticated;

grant usage on type
  public.session_source_module,
  public.session_status,
  public.registration_status,
  public.attendance_status
to authenticated;

grant select on public.sessions to authenticated;
grant select on public.session_interests to authenticated;
grant select on public.registrations to authenticated;
grant select on public.attendance_records to authenticated;
