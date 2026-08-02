-- Phase 3: private Pulse check-ins and deterministic recommendation inputs.
-- Discovery candidates, Sessions, registrations, and Passport activity begin later.

create type public.pulse_stimulation_level as enum ('low', 'moderate', 'high');
create type public.pulse_social_intensity as enum ('solo', 'light', 'social');
create type public.participation_format as enum ('in_person', 'online', 'either');

create table public.modes (
  id uuid primary key default gen_random_uuid(),
  slug extensions.citext not null unique,
  name text not null unique,
  description text not null,
  active boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  constraint modes_slug_format check (slug::text ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint modes_name_length check (char_length(name) between 1 and 40),
  constraint modes_description_length check (char_length(description) between 1 and 180)
);

create table public.pulse_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  mode_id uuid not null references public.modes (id) on delete restrict,
  energy_level smallint not null,
  stimulation_level public.pulse_stimulation_level not null,
  social_intensity public.pulse_social_intensity not null,
  preferred_format public.participation_format not null,
  available_minutes smallint not null,
  maximum_travel_miles smallint,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint pulse_check_ins_energy_range check (energy_level between 1 and 5),
  constraint pulse_check_ins_available_minutes check (
    available_minutes in (30, 60, 120, 240)
  ),
  constraint pulse_check_ins_travel_range check (
    maximum_travel_miles is null or maximum_travel_miles in (5, 15, 30, 50)
  ),
  constraint pulse_check_ins_expiry_window check (
    expires_at > created_at and expires_at <= created_at + interval '24 hours'
  )
);

create table public.pulse_check_in_interests (
  check_in_id uuid not null references public.pulse_check_ins (id) on delete cascade,
  interest_id uuid not null references public.interests (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (check_in_id, interest_id)
);

create index pulse_check_ins_user_created_idx
on public.pulse_check_ins (user_id, created_at desc);

create index pulse_check_ins_expires_idx
on public.pulse_check_ins (expires_at);

create index pulse_check_in_interests_interest_idx
on public.pulse_check_in_interests (interest_id);

create or replace function public.record_pulse_check_in(
  p_mode_id uuid,
  p_energy_level integer,
  p_stimulation_level public.pulse_stimulation_level,
  p_social_intensity public.pulse_social_intensity,
  p_preferred_format public.participation_format,
  p_available_minutes integer,
  p_maximum_travel_miles integer,
  p_interest_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  check_in_id uuid := gen_random_uuid();
  recorded_at timestamptz := now();
  requested_interest_count integer;
  active_interest_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = current_user_id and onboarding_completed_at is not null
  ) then
    raise exception 'Onboarding required' using errcode = '42501';
  end if;

  if p_mode_id is null or not exists (
    select 1 from public.modes where id = p_mode_id and active
  ) then
    raise exception 'Invalid mode' using errcode = '22023';
  end if;
  if p_energy_level is null or p_energy_level not between 1 and 5 then
    raise exception 'Invalid energy level' using errcode = '22023';
  end if;
  if p_stimulation_level is null or p_social_intensity is null
     or p_preferred_format is null then
    raise exception 'Missing Pulse signal' using errcode = '22023';
  end if;
  if p_available_minutes is null or p_available_minutes not in (30, 60, 120, 240) then
    raise exception 'Invalid available time' using errcode = '22023';
  end if;
  if p_maximum_travel_miles is not null
     and p_maximum_travel_miles not in (5, 15, 30, 50) then
    raise exception 'Invalid travel range' using errcode = '22023';
  end if;

  if cardinality(coalesce(p_interest_ids, '{}'::uuid[])) > 5 then
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

  insert into public.pulse_check_ins (
    id,
    user_id,
    mode_id,
    energy_level,
    stimulation_level,
    social_intensity,
    preferred_format,
    available_minutes,
    maximum_travel_miles,
    created_at,
    expires_at
  ) values (
    check_in_id,
    current_user_id,
    p_mode_id,
    p_energy_level,
    p_stimulation_level,
    p_social_intensity,
    p_preferred_format,
    p_available_minutes,
    p_maximum_travel_miles,
    recorded_at,
    recorded_at + interval '24 hours'
  );

  insert into public.pulse_check_in_interests (check_in_id, interest_id)
  select check_in_id, id
  from unnest(coalesce(p_interest_ids, '{}'::uuid[])) as selected(id);

  return check_in_id;
end;
$$;

revoke all on function public.record_pulse_check_in(
  uuid,
  integer,
  public.pulse_stimulation_level,
  public.pulse_social_intensity,
  public.participation_format,
  integer,
  integer,
  uuid[]
) from public;

grant execute on function public.record_pulse_check_in(
  uuid,
  integer,
  public.pulse_stimulation_level,
  public.pulse_social_intensity,
  public.participation_format,
  integer,
  integer,
  uuid[]
) to authenticated;

alter table public.modes enable row level security;
alter table public.pulse_check_ins enable row level security;
alter table public.pulse_check_in_interests enable row level security;

create policy "modes_select_active"
on public.modes for select
to authenticated
using (active);

create policy "pulse_check_ins_select_own"
on public.pulse_check_ins for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "pulse_check_in_interests_select_own"
on public.pulse_check_in_interests for select
to authenticated
using (
  exists (
    select 1
    from public.pulse_check_ins
    where id = check_in_id and user_id = (select auth.uid())
  )
);

revoke all on public.modes from anon, authenticated;
revoke all on public.pulse_check_ins from anon, authenticated;
revoke all on public.pulse_check_in_interests from anon, authenticated;

grant usage on type
  public.pulse_stimulation_level,
  public.pulse_social_intensity,
  public.participation_format
to authenticated;

grant select on public.modes to authenticated;
grant select on public.pulse_check_ins to authenticated;
grant select on public.pulse_check_in_interests to authenticated;

insert into public.modes (slug, name, description, sort_order) values
  ('play', 'Play', 'Make room for curiosity, fun, and energizing shared experiences.', 10),
  ('create', 'Create', 'Turn available energy toward making, practicing, or contributing.', 20),
  ('connect', 'Connect', 'Find conversation, community, and a sense of belonging.', 30),
  ('focus', 'Focus', 'Choose intentional progress with fewer competing demands.', 40),
  ('reset', 'Reset', 'Protect capacity with calmer, lower-pressure ways to participate.', 50)
on conflict (slug) do nothing;
