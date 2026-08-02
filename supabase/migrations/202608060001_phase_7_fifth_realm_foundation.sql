-- Phase 7: Fifth Realm campaign discovery, private applications, authoritative
-- membership, GM tools, and shared Session associations. This migration is
-- system-neutral: copyrighted rules, virtual tabletop tools, chat, payments,
-- and Passport issuance remain outside this phase.

create type public.realm_campaign_status as enum (
  'draft', 'recruiting', 'active', 'completed', 'cancelled'
);
create type public.campaign_experience_level as enum (
  'new', 'comfortable', 'experienced'
);
create type public.campaign_application_status as enum (
  'submitted', 'accepted', 'declined', 'withdrawn'
);
create type public.campaign_member_role as enum ('game_master', 'player');
create type public.campaign_membership_status as enum ('active', 'left', 'removed');

create table public.realm_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles (id) on delete restrict,
  game_master_display_name text not null,
  circle_id uuid references public.circles (id) on delete set null,
  title text not null,
  summary text not null,
  premise text not null,
  genre text not null,
  tone text not null,
  safety_expectations text not null,
  status public.realm_campaign_status not null default 'draft',
  format public.participation_format not null,
  location_label text,
  schedule_summary text not null,
  timezone text not null,
  estimated_session_minutes integer not null,
  application_deadline timestamptz not null,
  player_capacity smallint not null,
  active_player_count smallint not null default 0,
  experience_level public.campaign_experience_level not null,
  mode_id uuid not null references public.modes (id) on delete restrict,
  minimum_energy smallint not null,
  maximum_energy smallint not null,
  stimulation_level public.pulse_stimulation_level not null,
  social_intensity public.pulse_social_intensity not null,
  published_at timestamptz,
  recruiting_closed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint realm_campaigns_title_length check (
    char_length(btrim(title)) between 5 and 120
  ),
  constraint realm_campaigns_summary_length check (
    char_length(btrim(summary)) between 10 and 280
  ),
  constraint realm_campaigns_premise_length check (
    char_length(btrim(premise)) between 20 and 5000
  ),
  constraint realm_campaigns_genre_length check (
    char_length(btrim(genre)) between 2 and 80
  ),
  constraint realm_campaigns_tone_length check (
    char_length(btrim(tone)) between 2 and 160
  ),
  constraint realm_campaigns_safety_length check (
    char_length(btrim(safety_expectations)) between 20 and 2000
  ),
  constraint realm_campaigns_schedule_length check (
    char_length(btrim(schedule_summary)) between 10 and 500
  ),
  constraint realm_campaigns_location_length check (
    location_label is null
    or char_length(btrim(location_label)) between 2 and 120
  ),
  constraint realm_campaigns_session_minutes check (
    estimated_session_minutes between 30 and 480
  ),
  constraint realm_campaigns_capacity check (
    player_capacity between 1 and 12
    and active_player_count between 0 and player_capacity
  ),
  constraint realm_campaigns_energy_range check (
    minimum_energy between 1 and 5
    and maximum_energy between 1 and 5
    and minimum_energy <= maximum_energy
  ),
  constraint realm_campaigns_lifecycle check (
    (status = 'draft' and published_at is null and recruiting_closed_at is null and completed_at is null)
    or (status = 'recruiting' and published_at is not null and recruiting_closed_at is null and completed_at is null)
    or (status = 'active' and published_at is not null and recruiting_closed_at is not null and completed_at is null)
    or (status = 'completed' and published_at is not null and recruiting_closed_at is not null and completed_at is not null)
    or (status = 'cancelled' and recruiting_closed_at is not null and completed_at is null)
  )
);

create trigger realm_campaigns_set_updated_at
before update on public.realm_campaigns
for each row execute function public.set_updated_at();

create table public.campaign_interests (
  campaign_id uuid not null references public.realm_campaigns (id) on delete cascade,
  interest_id uuid not null references public.interests (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (campaign_id, interest_id)
);

create table public.campaign_applications (
  campaign_id uuid not null references public.realm_campaigns (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  motivation text not null,
  availability text not null,
  experience_level public.campaign_experience_level not null,
  safety_acknowledged boolean not null default false,
  status public.campaign_application_status not null default 'submitted',
  submitted_at timestamptz not null default now(),
  accepted_at timestamptz,
  declined_at timestamptz,
  withdrawn_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (campaign_id, user_id),
  constraint campaign_applications_motivation_length check (
    char_length(btrim(motivation)) between 20 and 2000
  ),
  constraint campaign_applications_availability_length check (
    char_length(btrim(availability)) between 10 and 500
  ),
  constraint campaign_applications_safety_acknowledged check (safety_acknowledged),
  constraint campaign_applications_lifecycle check (
    (status = 'submitted' and accepted_at is null and declined_at is null and withdrawn_at is null)
    or (status = 'accepted' and accepted_at is not null and declined_at is null and withdrawn_at is null)
    or (status = 'declined' and accepted_at is null and declined_at is not null and withdrawn_at is null)
    or (status = 'withdrawn' and accepted_at is null and declined_at is null and withdrawn_at is not null)
  )
);

create trigger campaign_applications_set_updated_at
before update on public.campaign_applications
for each row execute function public.set_updated_at();

create table public.campaign_members (
  campaign_id uuid not null references public.realm_campaigns (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete restrict,
  role public.campaign_member_role not null default 'player',
  status public.campaign_membership_status not null default 'active',
  joined_at timestamptz not null default now(),
  ended_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (campaign_id, user_id),
  constraint campaign_members_lifecycle check (
    (status = 'active' and ended_at is null)
    or (status in ('left', 'removed') and ended_at is not null)
  )
);

create trigger campaign_members_set_updated_at
before update on public.campaign_members
for each row execute function public.set_updated_at();

alter table public.sessions
add column campaign_id uuid references public.realm_campaigns (id) on delete set null;

alter table public.sessions
add constraint sessions_realm_source_consistency check (
  (campaign_id is null and source_module <> 'realm')
  or (campaign_id is not null and source_module = 'realm')
);

create table private.realm_campaign_status_audit_logs (
  id bigint generated always as identity primary key,
  campaign_id uuid not null,
  previous_status public.realm_campaign_status,
  new_status public.realm_campaign_status not null,
  actor_user_id uuid,
  occurred_at timestamptz not null default now()
);

create table private.campaign_application_audit_logs (
  id bigint generated always as identity primary key,
  campaign_id uuid not null,
  target_user_id uuid not null,
  previous_status public.campaign_application_status,
  new_status public.campaign_application_status not null,
  actor_user_id uuid,
  occurred_at timestamptz not null default now()
);

create table private.campaign_membership_audit_logs (
  id bigint generated always as identity primary key,
  campaign_id uuid not null,
  target_user_id uuid not null,
  previous_status public.campaign_membership_status,
  new_status public.campaign_membership_status not null,
  actor_user_id uuid,
  occurred_at timestamptz not null default now()
);

revoke all on private.realm_campaign_status_audit_logs from public, anon, authenticated;
revoke all on private.campaign_application_audit_logs from public, anon, authenticated;
revoke all on private.campaign_membership_audit_logs from public, anon, authenticated;

create or replace function private.audit_realm_campaign_status_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into private.realm_campaign_status_audit_logs
      (campaign_id, previous_status, new_status, actor_user_id)
    values
      (new.id, case when tg_op = 'UPDATE' then old.status else null end, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create or replace function private.audit_campaign_application_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into private.campaign_application_audit_logs
      (campaign_id, target_user_id, previous_status, new_status, actor_user_id)
    values
      (new.campaign_id, new.user_id, case when tg_op = 'UPDATE' then old.status else null end, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create or replace function private.audit_campaign_membership_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into private.campaign_membership_audit_logs
      (campaign_id, target_user_id, previous_status, new_status, actor_user_id)
    values
      (new.campaign_id, new.user_id, case when tg_op = 'UPDATE' then old.status else null end, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger realm_campaign_status_audit_change
after insert or update on public.realm_campaigns
for each row execute function private.audit_realm_campaign_status_change();
create trigger campaign_application_audit_change
after insert or update on public.campaign_applications
for each row execute function private.audit_campaign_application_change();
create trigger campaign_membership_audit_change
after insert or update on public.campaign_members
for each row execute function private.audit_campaign_membership_change();

revoke all on function private.audit_realm_campaign_status_change() from public;
revoke all on function private.audit_campaign_application_change() from public;
revoke all on function private.audit_campaign_membership_change() from public;

create index realm_campaigns_discovery_idx
on public.realm_campaigns (status, application_deadline, created_at desc, id);
create index realm_campaigns_gm_idx
on public.realm_campaigns (created_by, status, updated_at desc);
create index realm_campaigns_circle_idx
on public.realm_campaigns (circle_id, status, application_deadline);
create index campaign_interests_interest_idx
on public.campaign_interests (interest_id, campaign_id);
create index campaign_applications_user_idx
on public.campaign_applications (user_id, status, updated_at desc);
create index campaign_applications_queue_idx
on public.campaign_applications (campaign_id, status, submitted_at);
create index campaign_members_user_idx
on public.campaign_members (user_id, status, joined_at desc);
create index sessions_campaign_idx
on public.sessions (campaign_id, status, starts_at);

create or replace function public.can_manage_realm_campaign(p_campaign_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.realm_campaigns
    where id = p_campaign_id and created_by = auth.uid()
  ) or public.has_role('platform_admin');
$$;

create or replace function public.is_campaign_member(p_campaign_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.campaign_members
    where campaign_id = p_campaign_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.can_view_realm_campaign(p_campaign_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.realm_campaigns campaign
    where campaign.id = p_campaign_id
      and campaign.status in ('recruiting', 'active', 'completed')
      and (
        campaign.circle_id is null
        or exists (
          select 1 from public.circles
          where id = campaign.circle_id
            and status = 'published'
            and visibility = 'public'
        )
        or public.is_circle_member(campaign.circle_id)
      )
  )
  or public.can_manage_realm_campaign(p_campaign_id)
  or public.is_campaign_member(p_campaign_id)
  or exists (
    select 1 from public.campaign_applications
    where campaign_id = p_campaign_id and user_id = auth.uid()
  );
$$;

revoke all on function public.can_manage_realm_campaign(uuid) from public;
revoke all on function public.is_campaign_member(uuid) from public;
revoke all on function public.can_view_realm_campaign(uuid) from public;
grant execute on function public.can_manage_realm_campaign(uuid) to authenticated;
grant execute on function public.is_campaign_member(uuid) to authenticated;
grant execute on function public.can_view_realm_campaign(uuid) to authenticated;

create or replace function public.create_realm_campaign(
  p_circle_id uuid,
  p_title text,
  p_summary text,
  p_premise text,
  p_genre text,
  p_tone text,
  p_safety_expectations text,
  p_format public.participation_format,
  p_location_label text,
  p_schedule_summary text,
  p_timezone text,
  p_estimated_session_minutes integer,
  p_application_deadline_local text,
  p_player_capacity integer,
  p_experience_level public.campaign_experience_level,
  p_mode_id uuid,
  p_minimum_energy integer,
  p_maximum_energy integer,
  p_stimulation_level public.pulse_stimulation_level,
  p_social_intensity public.pulse_social_intensity,
  p_interest_ids uuid[]
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  current_user_id uuid := auth.uid();
  campaign_id uuid := gen_random_uuid();
  gm_name text;
  deadline_at timestamptz;
  requested_interest_count integer;
  active_interest_count integer;
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
  if not (public.has_role('game_master') or public.has_role('platform_admin')) then
    raise exception 'Game-master role required' using errcode = '42501';
  end if;
  if p_circle_id is not null and (
    not public.can_host_circle(p_circle_id)
    or not exists (select 1 from public.circles where id = p_circle_id and status <> 'archived')
  ) then
    raise exception 'Circle hosting authority required' using errcode = '42501';
  end if;

  select coalesce(nullif(btrim(display_name), ''), nullif(btrim(username::text), ''), 'FIFTHS game master')
  into gm_name from public.profiles where id = current_user_id;

  if char_length(btrim(p_title)) not between 5 and 120
     or char_length(btrim(p_summary)) not between 10 and 280
     or char_length(btrim(p_premise)) not between 20 and 5000
     or char_length(btrim(p_genre)) not between 2 and 80
     or char_length(btrim(p_tone)) not between 2 and 160
     or char_length(btrim(p_safety_expectations)) not between 20 and 2000
     or char_length(btrim(p_schedule_summary)) not between 10 and 500 then
    raise exception 'Invalid campaign content' using errcode = '22023';
  end if;
  if p_location_label is not null
     and char_length(btrim(p_location_label)) not between 2 and 120 then
    raise exception 'Invalid location label' using errcode = '22023';
  end if;
  if p_timezone is null or not exists (
    select 1 from pg_catalog.pg_timezone_names where name = p_timezone
  ) then
    raise exception 'Invalid timezone' using errcode = '22023';
  end if;
  begin
    deadline_at := p_application_deadline_local::timestamp at time zone p_timezone;
  exception when others then
    raise exception 'Invalid application deadline' using errcode = '22023';
  end;
  if deadline_at <= now() + interval '1 hour'
     or deadline_at > now() + interval '1 year' then
    raise exception 'Invalid application deadline' using errcode = '22023';
  end if;
  if p_estimated_session_minutes not between 30 and 480
     or p_player_capacity not between 1 and 12 then
    raise exception 'Invalid session duration or player capacity' using errcode = '22023';
  end if;
  if p_mode_id is null or not exists (
    select 1 from public.modes where id = p_mode_id and active
  ) then
    raise exception 'Invalid mode' using errcode = '22023';
  end if;
  if p_minimum_energy not between 1 and 5
     or p_maximum_energy not between 1 and 5
     or p_minimum_energy > p_maximum_energy then
    raise exception 'Invalid energy range' using errcode = '22023';
  end if;
  if cardinality(coalesce(p_interest_ids, '{}'::uuid[])) not between 1 and 8 then
    raise exception 'Choose between one and eight interests' using errcode = '22023';
  end if;
  select count(distinct id) into requested_interest_count
  from unnest(coalesce(p_interest_ids, '{}'::uuid[])) selected(id);
  select count(*) into active_interest_count
  from public.interests where active and id = any(coalesce(p_interest_ids, '{}'::uuid[]));
  if requested_interest_count <> cardinality(p_interest_ids)
     or active_interest_count <> requested_interest_count then
    raise exception 'Invalid interest selection' using errcode = '22023';
  end if;

  insert into public.realm_campaigns (
    id, created_by, game_master_display_name, circle_id, title, summary,
    premise, genre, tone, safety_expectations, format, location_label,
    schedule_summary, timezone, estimated_session_minutes,
    application_deadline, player_capacity, experience_level, mode_id,
    minimum_energy, maximum_energy, stimulation_level, social_intensity
  ) values (
    campaign_id, current_user_id, gm_name, p_circle_id, btrim(p_title),
    btrim(p_summary), btrim(p_premise), btrim(p_genre), btrim(p_tone),
    btrim(p_safety_expectations), p_format, nullif(btrim(p_location_label), ''),
    btrim(p_schedule_summary), p_timezone, p_estimated_session_minutes,
    deadline_at, p_player_capacity, p_experience_level, p_mode_id,
    p_minimum_energy, p_maximum_energy, p_stimulation_level, p_social_intensity
  );
  insert into public.campaign_interests (campaign_id, interest_id)
  select campaign_id, id from unnest(p_interest_ids) selected(id);
  insert into public.campaign_members (campaign_id, user_id, role)
  values (campaign_id, current_user_id, 'game_master');
  return campaign_id;
end;
$$;

create or replace function public.set_realm_campaign_status(
  p_campaign_id uuid,
  p_status public.realm_campaign_status
)
returns void language plpgsql security definer set search_path = '' as $$
declare current_campaign public.realm_campaigns%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select * into current_campaign from public.realm_campaigns
  where id = p_campaign_id for update;
  if not found or not public.can_manage_realm_campaign(p_campaign_id) then
    raise exception 'Campaign management denied' using errcode = '42501';
  end if;
  if p_status = 'recruiting' and current_campaign.status = 'draft'
     and current_campaign.application_deadline > now() then
    update public.realm_campaigns set status = 'recruiting', published_at = now()
    where id = p_campaign_id;
  elsif p_status = 'active' and current_campaign.status = 'recruiting'
        and current_campaign.active_player_count > 0 then
    update public.realm_campaigns
    set status = 'active', recruiting_closed_at = now()
    where id = p_campaign_id;
  elsif p_status = 'completed' and current_campaign.status = 'active' then
    update public.realm_campaigns set status = 'completed', completed_at = now()
    where id = p_campaign_id;
  elsif p_status = 'cancelled' and current_campaign.status in ('draft', 'recruiting', 'active') then
    update public.realm_campaigns
    set status = 'cancelled', recruiting_closed_at = coalesce(recruiting_closed_at, now())
    where id = p_campaign_id;
  else
    raise exception 'Invalid campaign status transition' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.submit_campaign_application(
  p_campaign_id uuid,
  p_motivation text,
  p_availability text,
  p_experience_level public.campaign_experience_level,
  p_safety_acknowledged boolean
)
returns void language plpgsql security definer set search_path = '' as $$
declare current_campaign public.realm_campaigns%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select * into current_campaign from public.realm_campaigns
  where id = p_campaign_id for update;
  if not found or current_campaign.status <> 'recruiting'
     or current_campaign.application_deadline <= now()
     or current_campaign.active_player_count >= current_campaign.player_capacity
     or not public.can_view_realm_campaign(p_campaign_id)
     or public.is_campaign_member(p_campaign_id) then
    raise exception 'Campaign is not accepting applications' using errcode = '22023';
  end if;
  if auth.uid() = current_campaign.created_by
     or char_length(btrim(p_motivation)) not between 20 and 2000
     or char_length(btrim(p_availability)) not between 10 and 500
     or p_safety_acknowledged is distinct from true then
    raise exception 'Invalid campaign application' using errcode = '22023';
  end if;
  insert into public.campaign_applications (
    campaign_id, user_id, motivation, availability, experience_level,
    safety_acknowledged, status, submitted_at, accepted_at, declined_at, withdrawn_at
  ) values (
    p_campaign_id, auth.uid(), btrim(p_motivation), btrim(p_availability),
    p_experience_level, true, 'submitted', now(), null, null, null
  ) on conflict (campaign_id, user_id) do update
    set motivation = excluded.motivation,
        availability = excluded.availability,
        experience_level = excluded.experience_level,
        safety_acknowledged = true,
        status = 'submitted', submitted_at = now(), accepted_at = null,
        declined_at = null, withdrawn_at = null
    where campaign_applications.status in ('declined', 'withdrawn');
  if not found then
    raise exception 'Application already exists' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.withdraw_campaign_application(p_campaign_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  update public.campaign_applications
  set status = 'withdrawn', withdrawn_at = now()
  where campaign_id = p_campaign_id and user_id = auth.uid() and status = 'submitted';
  if not found then
    raise exception 'Submitted application required' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.review_campaign_application(
  p_campaign_id uuid,
  p_user_id uuid,
  p_decision text
)
returns void language plpgsql security definer set search_path = '' as $$
declare current_campaign public.realm_campaigns%rowtype;
begin
  if auth.uid() is null or not public.can_manage_realm_campaign(p_campaign_id) then
    raise exception 'Campaign management denied' using errcode = '42501';
  end if;
  if p_decision not in ('accept', 'decline') then
    raise exception 'Invalid application decision' using errcode = '22023';
  end if;
  select * into current_campaign from public.realm_campaigns
  where id = p_campaign_id for update;
  if current_campaign.status <> 'recruiting' then
    raise exception 'Campaign is not recruiting' using errcode = '22023';
  end if;
  perform 1 from public.campaign_applications
  where campaign_id = p_campaign_id and user_id = p_user_id and status = 'submitted'
  for update;
  if not found then
    raise exception 'Application is not reviewable' using errcode = '22023';
  end if;
  if p_decision = 'accept' then
    if current_campaign.active_player_count >= current_campaign.player_capacity then
      raise exception 'Campaign is full' using errcode = '22023';
    end if;
    update public.campaign_applications set status = 'accepted', accepted_at = now()
    where campaign_id = p_campaign_id and user_id = p_user_id;
    insert into public.campaign_members (campaign_id, user_id, role, status, joined_at, ended_at)
    values (p_campaign_id, p_user_id, 'player', 'active', now(), null)
    on conflict (campaign_id, user_id) do update
      set role = 'player', status = 'active', joined_at = now(), ended_at = null;
    update public.realm_campaigns
    set active_player_count = active_player_count + 1
    where id = p_campaign_id;
  else
    update public.campaign_applications set status = 'declined', declined_at = now()
    where campaign_id = p_campaign_id and user_id = p_user_id;
  end if;
end;
$$;

create or replace function public.leave_realm_campaign(p_campaign_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  perform 1 from public.realm_campaigns where id = p_campaign_id for update;
  update public.campaign_members set status = 'left', ended_at = now()
  where campaign_id = p_campaign_id and user_id = auth.uid()
    and role = 'player' and status = 'active';
  if not found then
    raise exception 'Active player membership required' using errcode = '22023';
  end if;
  update public.realm_campaigns
  set active_player_count = greatest(active_player_count - 1, 0)
  where id = p_campaign_id;
end;
$$;

create or replace function public.remove_campaign_member(p_campaign_id uuid, p_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.can_manage_realm_campaign(p_campaign_id) then
    raise exception 'Campaign management denied' using errcode = '42501';
  end if;
  perform 1 from public.realm_campaigns where id = p_campaign_id for update;
  update public.campaign_members set status = 'removed', ended_at = now()
  where campaign_id = p_campaign_id and user_id = p_user_id
    and role = 'player' and status = 'active';
  if not found then
    raise exception 'Active player membership required' using errcode = '22023';
  end if;
  update public.realm_campaigns
  set active_player_count = greatest(active_player_count - 1, 0)
  where id = p_campaign_id;
end;
$$;

create or replace function public.get_realm_campaign_roster(p_campaign_id uuid)
returns table (
  user_id uuid, display_name text, username text,
  member_role public.campaign_member_role,
  membership_status public.campaign_membership_status,
  joined_at timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not (
    public.can_manage_realm_campaign(p_campaign_id)
    or public.is_campaign_member(p_campaign_id)
  ) then
    raise exception 'Campaign roster denied' using errcode = '42501';
  end if;
  return query select member.user_id,
    coalesce(profile.display_name, 'FIFTHS member'), profile.username::text,
    member.role, member.status, member.joined_at
  from public.campaign_members member
  join public.profiles profile on profile.id = member.user_id
  where member.campaign_id = p_campaign_id and member.status = 'active'
  order by case when member.role = 'game_master' then 0 else 1 end,
    coalesce(profile.display_name, 'FIFTHS member');
end;
$$;

create or replace function public.get_realm_campaign_applications(p_campaign_id uuid)
returns table (
  user_id uuid, display_name text, username text, motivation text,
  availability text, experience_level public.campaign_experience_level,
  application_status public.campaign_application_status,
  submitted_at timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.can_manage_realm_campaign(p_campaign_id) then
    raise exception 'Campaign application access denied' using errcode = '42501';
  end if;
  return query select application.user_id,
    coalesce(profile.display_name, 'FIFTHS member'), profile.username::text,
    application.motivation, application.availability,
    application.experience_level, application.status, application.submitted_at
  from public.campaign_applications application
  join public.profiles profile on profile.id = application.user_id
  where application.campaign_id = p_campaign_id
  order by application.submitted_at, application.user_id;
end;
$$;

create or replace function public.set_session_campaign(p_session_id uuid, p_campaign_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  current_session public.sessions%rowtype;
  current_campaign public.realm_campaigns%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select * into current_session from public.sessions where id = p_session_id for update;
  if not found or not public.can_manage_session(p_session_id) or current_session.status <> 'draft' then
    raise exception 'Draft Session management required' using errcode = '42501';
  end if;
  if p_campaign_id is null then
    update public.sessions
    set campaign_id = null,
        source_module = case when circle_id is null then 'platform'::public.session_source_module else 'circles'::public.session_source_module end
    where id = p_session_id;
    return;
  end if;
  select * into current_campaign from public.realm_campaigns where id = p_campaign_id;
  if not found or not public.can_manage_realm_campaign(p_campaign_id)
     or current_campaign.status not in ('recruiting', 'active')
     or current_session.circle_id is distinct from current_campaign.circle_id then
    raise exception 'Campaign Session association denied' using errcode = '42501';
  end if;
  update public.sessions set campaign_id = p_campaign_id, source_module = 'realm'
  where id = p_session_id;
end;
$$;

-- Realm Sessions inherit campaign membership visibility in addition to Circle
-- visibility. Existing registrations and Session managers keep lifecycle access.
create or replace function public.can_view_session(p_session_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.sessions
    left join public.circles on circles.id = sessions.circle_id
    where sessions.id = p_session_id and sessions.status = 'published'
      and (
        (sessions.campaign_id is not null and public.is_campaign_member(sessions.campaign_id))
        or (
          sessions.campaign_id is null and (
            sessions.circle_id is null
            or (circles.status = 'published' and (circles.visibility = 'public' or public.is_circle_member(sessions.circle_id)))
          )
        )
      )
  ) or public.can_manage_session(p_session_id) or exists (
    select 1 from public.registrations
    where session_id = p_session_id and user_id = auth.uid()
  );
$$;

-- A Circle with active Realm work cannot be archived.
create or replace function public.set_circle_status(p_circle_id uuid, p_status public.circle_status)
returns void language plpgsql security definer set search_path = '' as $$
declare current_circle public.circles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select * into current_circle from public.circles where id = p_circle_id for update;
  if not found or not public.can_manage_circle(p_circle_id) then
    raise exception 'Circle management denied' using errcode = '42501';
  end if;
  if p_status = 'published' and current_circle.status = 'draft' then
    update public.circles set status = 'published', published_at = now() where id = p_circle_id;
  elsif p_status = 'archived' and current_circle.status in ('draft', 'published')
    and not exists (select 1 from public.sessions where circle_id = p_circle_id and status = 'published' and starts_at > now())
    and not exists (select 1 from public.creator_opportunities where circle_id = p_circle_id and status = 'published')
    and not exists (select 1 from public.realm_campaigns where circle_id = p_circle_id and status in ('recruiting', 'active')) then
    update public.circles set status = 'archived' where id = p_circle_id;
  else
    raise exception 'Invalid Circle status transition' using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.create_realm_campaign(
  uuid, text, text, text, text, text, text, public.participation_format,
  text, text, text, integer, text, integer, public.campaign_experience_level,
  uuid, integer, integer, public.pulse_stimulation_level,
  public.pulse_social_intensity, uuid[]
) from public;
revoke all on function public.set_realm_campaign_status(uuid, public.realm_campaign_status) from public;
revoke all on function public.submit_campaign_application(uuid, text, text, public.campaign_experience_level, boolean) from public;
revoke all on function public.withdraw_campaign_application(uuid) from public;
revoke all on function public.review_campaign_application(uuid, uuid, text) from public;
revoke all on function public.leave_realm_campaign(uuid) from public;
revoke all on function public.remove_campaign_member(uuid, uuid) from public;
revoke all on function public.get_realm_campaign_roster(uuid) from public;
revoke all on function public.get_realm_campaign_applications(uuid) from public;
revoke all on function public.set_session_campaign(uuid, uuid) from public;

grant execute on function public.create_realm_campaign(
  uuid, text, text, text, text, text, text, public.participation_format,
  text, text, text, integer, text, integer, public.campaign_experience_level,
  uuid, integer, integer, public.pulse_stimulation_level,
  public.pulse_social_intensity, uuid[]
) to authenticated;
grant execute on function public.set_realm_campaign_status(uuid, public.realm_campaign_status) to authenticated;
grant execute on function public.submit_campaign_application(uuid, text, text, public.campaign_experience_level, boolean) to authenticated;
grant execute on function public.withdraw_campaign_application(uuid) to authenticated;
grant execute on function public.review_campaign_application(uuid, uuid, text) to authenticated;
grant execute on function public.leave_realm_campaign(uuid) to authenticated;
grant execute on function public.remove_campaign_member(uuid, uuid) to authenticated;
grant execute on function public.get_realm_campaign_roster(uuid) to authenticated;
grant execute on function public.get_realm_campaign_applications(uuid) to authenticated;
grant execute on function public.set_session_campaign(uuid, uuid) to authenticated;

alter table public.realm_campaigns enable row level security;
alter table public.campaign_interests enable row level security;
alter table public.campaign_applications enable row level security;
alter table public.campaign_members enable row level security;

create policy "realm_campaigns_select_eligible"
on public.realm_campaigns for select to authenticated
using (public.can_view_realm_campaign(id));
create policy "campaign_interests_select_eligible"
on public.campaign_interests for select to authenticated
using (public.can_view_realm_campaign(campaign_id));
create policy "campaign_applications_select_own_or_manager"
on public.campaign_applications for select to authenticated
using (user_id = (select auth.uid()) or public.can_manage_realm_campaign(campaign_id));
create policy "campaign_members_select_member_or_manager"
on public.campaign_members for select to authenticated
using (public.is_campaign_member(campaign_id) or public.can_manage_realm_campaign(campaign_id));

revoke all on public.realm_campaigns from anon, authenticated;
revoke all on public.campaign_interests from anon, authenticated;
revoke all on public.campaign_applications from anon, authenticated;
revoke all on public.campaign_members from anon, authenticated;
grant usage on type public.realm_campaign_status, public.campaign_experience_level,
  public.campaign_application_status, public.campaign_member_role,
  public.campaign_membership_status to authenticated;
grant select on public.realm_campaigns to authenticated;
grant select on public.campaign_interests to authenticated;
grant select on public.campaign_applications to authenticated;
grant select on public.campaign_members to authenticated;
