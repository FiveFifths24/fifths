-- Phase 2: account, profile, role, taxonomy, onboarding, and RLS foundation.
-- Product tables and behavior intentionally begin in later phases.

create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "citext" with schema extensions;

create type public.profile_visibility as enum ('private', 'members', 'public');
create type public.app_role as enum (
  'member',
  'host',
  'moderator',
  'creator',
  'game_master',
  'organization_admin',
  'platform_admin'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username extensions.citext unique,
  display_name text,
  pronouns text,
  timezone text not null default 'UTC',
  avatar_url text,
  visibility public.profile_visibility not null default 'members',
  age_confirmed_at timestamptz,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (
    username is null or username::text ~ '^[a-z0-9](?:[a-z0-9_]*[a-z0-9])?$'
  ),
  constraint profiles_username_length check (
    username is null or char_length(username::text) between 3 and 30
  ),
  constraint profiles_display_name_length check (
    display_name is null or char_length(display_name) between 1 and 80
  ),
  constraint profiles_pronouns_length check (
    pronouns is null or char_length(pronouns) <= 40
  ),
  constraint profiles_timezone_length check (char_length(timezone) between 1 and 80)
);

create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  granted_by uuid references auth.users (id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.interests (
  id uuid primary key default gen_random_uuid(),
  slug extensions.citext not null unique,
  name text not null unique,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint interests_slug_format check (slug::text ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint interests_name_length check (char_length(name) between 1 and 60)
);

create table public.profile_interests (
  user_id uuid not null references public.profiles (id) on delete cascade,
  interest_id uuid not null references public.interests (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (user_id, interest_id)
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  slug extensions.citext not null unique,
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint skills_slug_format check (slug::text ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint skills_name_length check (char_length(name) between 1 and 60)
);

create table public.profile_skills (
  user_id uuid not null references public.profiles (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.role_audit_logs (
  id bigint generated always as identity primary key,
  target_user_id uuid not null,
  role public.app_role not null,
  operation text not null check (operation in ('INSERT', 'DELETE')),
  actor_user_id uuid,
  occurred_at timestamptz not null default now()
);

revoke all on private.role_audit_logs from public, anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

revoke all on function public.set_updated_at() from public;

create or replace function private.audit_user_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.role_audit_logs (
    target_user_id,
    role,
    operation,
    actor_user_id
  ) values (
    case when tg_op = 'DELETE' then old.user_id else new.user_id end,
    case when tg_op = 'DELETE' then old.role else new.role end,
    tg_op,
    auth.uid()
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger user_roles_audit_change
after insert or delete on public.user_roles
for each row execute function private.audit_user_role_change();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, age_confirmed_at)
  values (
    new.id,
    case
      when coalesce(new.raw_user_meta_data ->> 'age_confirmed', 'false') = 'true'
        then now()
      else null
    end
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'member')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

revoke all on function public.handle_new_user() from public;

-- Backfill safely if the migration is applied to a project with existing Auth users.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
select id, 'member'::public.app_role from auth.users
on conflict (user_id, role) do nothing;

create or replace function public.has_role(requested_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid() and role = requested_role
  );
$$;

revoke all on function public.has_role(public.app_role) from public;
grant execute on function public.has_role(public.app_role) to authenticated;

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
     or char_length(p_username) not between 3 and 30 then
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
  if requested_interest_count > 12 or requested_interest_count <> active_interest_count then
    raise exception 'Invalid interest selection' using errcode = '22023';
  end if;

  select count(distinct id) into requested_skill_count
  from unnest(coalesce(p_skill_ids, '{}'::uuid[])) as selected(id);
  select count(*) into active_skill_count
  from public.skills
  where active and id = any(coalesce(p_skill_ids, '{}'::uuid[]));
  if requested_skill_count > 12 or requested_skill_count <> active_skill_count then
    raise exception 'Invalid skill selection' using errcode = '22023';
  end if;

  update public.profiles
  set
    username = lower(btrim(p_username)),
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

revoke all on function public.complete_onboarding(text, text, text, text, uuid[], uuid[]) from public;
grant execute on function public.complete_onboarding(text, text, text, text, uuid[], uuid[]) to authenticated;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.interests enable row level security;
alter table public.profile_interests enable row level security;
alter table public.skills enable row level security;
alter table public.profile_skills enable row level security;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "user_roles_select_own"
on public.user_roles for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "interests_select_active"
on public.interests for select
to authenticated
using (active);

create policy "profile_interests_select_own"
on public.profile_interests for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "skills_select_active"
on public.skills for select
to authenticated
using (active);

create policy "profile_skills_select_own"
on public.profile_skills for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.profiles from anon, authenticated;
revoke all on public.user_roles from anon, authenticated;
revoke all on public.interests from anon, authenticated;
revoke all on public.profile_interests from anon, authenticated;
revoke all on public.skills from anon, authenticated;
revoke all on public.profile_skills from anon, authenticated;

grant select on public.profiles to authenticated;
grant usage on type public.profile_visibility, public.app_role to authenticated;
grant select on public.user_roles to authenticated;
grant select on public.interests to authenticated;
grant select on public.profile_interests to authenticated;
grant select on public.skills to authenticated;
grant select on public.profile_skills to authenticated;

insert into public.interests (slug, name, description) values
  ('arts-culture', 'Arts & culture', 'Creative and cultural experiences.'),
  ('career-growth', 'Career growth', 'Professional learning and opportunity.'),
  ('community-service', 'Community service', 'Local contribution and mutual support.'),
  ('creative-tech', 'Creative technology', 'Digital making and emerging tools.'),
  ('gaming', 'Gaming', 'Social and immersive play.'),
  ('health-wellbeing', 'Health & wellbeing', 'Non-clinical wellbeing experiences.'),
  ('music', 'Music', 'Listening, making, and live experiences.'),
  ('networking', 'Networking', 'Relationship and community building.'),
  ('storytelling', 'Storytelling', 'Writing, performance, and shared narrative.'),
  ('workshops', 'Workshops', 'Hands-on learning and practice.')
on conflict (slug) do nothing;

insert into public.skills (slug, name) values
  ('audio-production', 'Audio production'),
  ('community-organizing', 'Community organizing'),
  ('design', 'Design'),
  ('event-production', 'Event production'),
  ('facilitation', 'Facilitation'),
  ('game-mastering', 'Game mastering'),
  ('photography', 'Photography'),
  ('project-management', 'Project management'),
  ('video-production', 'Video production'),
  ('writing', 'Writing')
on conflict (slug) do nothing;
