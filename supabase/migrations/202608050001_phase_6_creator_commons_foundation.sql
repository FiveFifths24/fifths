-- Phase 6: Creator Commons opportunity creation, discovery, saves, responses,
-- selection, and confirmed completion. Payments, contracts, messaging, files,
-- organizations, Realm, and Passport issuance remain later-phase work.

create type public.creator_opportunity_kind as enum (
  'collaboration',
  'project',
  'volunteer',
  'mentorship'
);
create type public.creator_opportunity_status as enum (
  'draft',
  'published',
  'closed',
  'completed',
  'cancelled'
);
create type public.creator_opportunity_close_reason as enum (
  'manual',
  'filled',
  'deadline'
);
create type public.opportunity_response_status as enum (
  'submitted',
  'accepted',
  'declined',
  'withdrawn',
  'completed'
);

create table public.creator_opportunities (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles (id) on delete restrict,
  creator_display_name text not null,
  circle_id uuid references public.circles (id) on delete set null,
  title text not null,
  summary text not null,
  description text not null,
  deliverables text not null,
  kind public.creator_opportunity_kind not null,
  status public.creator_opportunity_status not null default 'draft',
  close_reason public.creator_opportunity_close_reason,
  format public.participation_format not null,
  location_label text,
  response_deadline timestamptz not null,
  timezone text not null,
  estimated_minutes integer not null,
  positions smallint not null,
  accepted_count smallint not null default 0,
  mode_id uuid not null references public.modes (id) on delete restrict,
  minimum_energy smallint not null,
  maximum_energy smallint not null,
  stimulation_level public.pulse_stimulation_level not null,
  social_intensity public.pulse_social_intensity not null,
  published_at timestamptz,
  closed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint creator_opportunities_title_length check (
    char_length(btrim(title)) between 5 and 120
  ),
  constraint creator_opportunities_summary_length check (
    char_length(btrim(summary)) between 10 and 280
  ),
  constraint creator_opportunities_description_length check (
    char_length(btrim(description)) between 20 and 5000
  ),
  constraint creator_opportunities_deliverables_length check (
    char_length(btrim(deliverables)) between 20 and 3000
  ),
  constraint creator_opportunities_creator_name_length check (
    char_length(btrim(creator_display_name)) between 1 and 80
  ),
  constraint creator_opportunities_location_length check (
    location_label is null
    or char_length(btrim(location_label)) between 2 and 120
  ),
  constraint creator_opportunities_deadline_after_creation check (
    response_deadline > created_at
  ),
  constraint creator_opportunities_estimated_minutes check (
    estimated_minutes between 15 and 1440
  ),
  constraint creator_opportunities_positions check (
    positions between 1 and 25
    and accepted_count between 0 and positions
  ),
  constraint creator_opportunities_energy_range check (
    minimum_energy between 1 and 5
    and maximum_energy between 1 and 5
    and minimum_energy <= maximum_energy
  ),
  constraint creator_opportunities_lifecycle check (
    (
      status = 'draft'
      and published_at is null
      and closed_at is null
      and completed_at is null
      and close_reason is null
    )
    or (
      status = 'published'
      and published_at is not null
      and closed_at is null
      and completed_at is null
      and close_reason is null
    )
    or (
      status = 'closed'
      and published_at is not null
      and closed_at is not null
      and completed_at is null
      and close_reason is not null
    )
    or (
      status = 'completed'
      and published_at is not null
      and closed_at is not null
      and completed_at is not null
      and close_reason is not null
    )
    or (
      status = 'cancelled'
      and closed_at is not null
      and completed_at is null
      and close_reason is null
    )
  )
);

create trigger creator_opportunities_set_updated_at
before update on public.creator_opportunities
for each row execute function public.set_updated_at();

create table public.opportunity_skills (
  opportunity_id uuid not null references public.creator_opportunities (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (opportunity_id, skill_id)
);

create table public.opportunity_interests (
  opportunity_id uuid not null references public.creator_opportunities (id) on delete cascade,
  interest_id uuid not null references public.interests (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (opportunity_id, interest_id)
);

create table public.opportunity_responses (
  opportunity_id uuid not null references public.creator_opportunities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  statement text not null,
  availability text not null,
  status public.opportunity_response_status not null default 'submitted',
  submitted_at timestamptz not null default now(),
  accepted_at timestamptz,
  declined_at timestamptz,
  withdrawn_at timestamptz,
  creator_confirmed_at timestamptz,
  participant_confirmed_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (opportunity_id, user_id),
  constraint opportunity_responses_statement_length check (
    char_length(btrim(statement)) between 20 and 2000
  ),
  constraint opportunity_responses_availability_length check (
    char_length(btrim(availability)) between 10 and 500
  ),
  constraint opportunity_responses_lifecycle check (
    (
      status = 'submitted'
      and accepted_at is null
      and declined_at is null
      and withdrawn_at is null
      and completed_at is null
    )
    or (
      status = 'accepted'
      and accepted_at is not null
      and declined_at is null
      and withdrawn_at is null
      and completed_at is null
    )
    or (
      status = 'declined'
      and accepted_at is null
      and declined_at is not null
      and withdrawn_at is null
      and completed_at is null
    )
    or (
      status = 'withdrawn'
      and declined_at is null
      and withdrawn_at is not null
      and completed_at is null
    )
    or (
      status = 'completed'
      and accepted_at is not null
      and declined_at is null
      and withdrawn_at is null
      and creator_confirmed_at is not null
      and participant_confirmed_at is not null
      and completed_at is not null
    )
  )
);

create trigger opportunity_responses_set_updated_at
before update on public.opportunity_responses
for each row execute function public.set_updated_at();

create table public.saved_opportunities (
  opportunity_id uuid not null references public.creator_opportunities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (opportunity_id, user_id)
);

create table private.creator_opportunity_status_audit_logs (
  id bigint generated always as identity primary key,
  opportunity_id uuid not null,
  previous_status public.creator_opportunity_status,
  new_status public.creator_opportunity_status not null,
  actor_user_id uuid,
  occurred_at timestamptz not null default now()
);

create table private.opportunity_response_audit_logs (
  id bigint generated always as identity primary key,
  opportunity_id uuid not null,
  target_user_id uuid not null,
  previous_status public.opportunity_response_status,
  new_status public.opportunity_response_status not null,
  actor_user_id uuid,
  occurred_at timestamptz not null default now()
);

revoke all on private.creator_opportunity_status_audit_logs from public, anon, authenticated;
revoke all on private.opportunity_response_audit_logs from public, anon, authenticated;

create or replace function private.audit_creator_opportunity_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into private.creator_opportunity_status_audit_logs (
      opportunity_id,
      previous_status,
      new_status,
      actor_user_id
    ) values (
      new.id,
      case when tg_op = 'UPDATE' then old.status else null end,
      new.status,
      auth.uid()
    );
  end if;
  return new;
end;
$$;

create or replace function private.audit_opportunity_response_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT'
     or old.status is distinct from new.status
     or old.creator_confirmed_at is distinct from new.creator_confirmed_at
     or old.participant_confirmed_at is distinct from new.participant_confirmed_at then
    insert into private.opportunity_response_audit_logs (
      opportunity_id,
      target_user_id,
      previous_status,
      new_status,
      actor_user_id
    ) values (
      new.opportunity_id,
      new.user_id,
      case when tg_op = 'UPDATE' then old.status else null end,
      new.status,
      auth.uid()
    );
  end if;
  return new;
end;
$$;

create trigger creator_opportunity_status_audit_change
after insert or update on public.creator_opportunities
for each row execute function private.audit_creator_opportunity_status_change();

create trigger opportunity_response_audit_change
after insert or update on public.opportunity_responses
for each row execute function private.audit_opportunity_response_change();

revoke all on function private.audit_creator_opportunity_status_change() from public;
revoke all on function private.audit_opportunity_response_change() from public;

create index creator_opportunities_discovery_idx
on public.creator_opportunities (status, response_deadline, created_at desc, id);

create index creator_opportunities_creator_idx
on public.creator_opportunities (created_by, status, updated_at desc);

create index creator_opportunities_circle_idx
on public.creator_opportunities (circle_id, status, response_deadline);

create index creator_opportunities_mode_idx
on public.creator_opportunities (mode_id, status);

create index opportunity_skills_skill_idx
on public.opportunity_skills (skill_id, opportunity_id);

create index opportunity_interests_interest_idx
on public.opportunity_interests (interest_id, opportunity_id);

create index opportunity_responses_user_idx
on public.opportunity_responses (user_id, status, updated_at desc);

create index opportunity_responses_queue_idx
on public.opportunity_responses (opportunity_id, status, submitted_at);

create index saved_opportunities_user_idx
on public.saved_opportunities (user_id, created_at desc);

create or replace function public.can_manage_creator_opportunity(p_opportunity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.creator_opportunities
    where id = p_opportunity_id
      and (
        created_by = auth.uid()
        or (
          circle_id is not null
          and public.can_host_circle(circle_id)
        )
      )
  ) or public.has_role('platform_admin');
$$;

create or replace function public.can_view_creator_opportunity(p_opportunity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.creator_opportunities opportunity
    where opportunity.id = p_opportunity_id
      and opportunity.status = 'published'
      and opportunity.response_deadline > now()
      and (
        opportunity.circle_id is null
        or exists (
          select 1 from public.circles
          where id = opportunity.circle_id
            and status = 'published'
            and visibility = 'public'
        )
        or public.is_circle_member(opportunity.circle_id)
      )
  )
  or public.can_manage_creator_opportunity(p_opportunity_id)
  or exists (
    select 1 from public.opportunity_responses
    where opportunity_id = p_opportunity_id
      and user_id = auth.uid()
  )
  or exists (
    select 1 from public.saved_opportunities
    where opportunity_id = p_opportunity_id
      and user_id = auth.uid()
  );
$$;

revoke all on function public.can_manage_creator_opportunity(uuid) from public;
revoke all on function public.can_view_creator_opportunity(uuid) from public;
grant execute on function public.can_manage_creator_opportunity(uuid) to authenticated;
grant execute on function public.can_view_creator_opportunity(uuid) to authenticated;

create or replace function public.create_creator_opportunity(
  p_circle_id uuid,
  p_title text,
  p_summary text,
  p_description text,
  p_deliverables text,
  p_kind public.creator_opportunity_kind,
  p_format public.participation_format,
  p_location_label text,
  p_response_deadline_local text,
  p_timezone text,
  p_estimated_minutes integer,
  p_positions integer,
  p_mode_id uuid,
  p_minimum_energy integer,
  p_maximum_energy integer,
  p_stimulation_level public.pulse_stimulation_level,
  p_social_intensity public.pulse_social_intensity,
  p_skill_ids uuid[],
  p_interest_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  opportunity_id uuid := gen_random_uuid();
  creator_name text;
  requested_skill_count integer;
  active_skill_count integer;
  requested_interest_count integer;
  active_interest_count integer;
  deadline_at timestamptz;
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

  if p_circle_id is null then
    if not (public.has_role('creator') or public.has_role('platform_admin')) then
      raise exception 'Creator role required' using errcode = '42501';
    end if;
  elsif not public.can_host_circle(p_circle_id)
        or not exists (
          select 1 from public.circles
          where id = p_circle_id and status <> 'archived'
        ) then
    raise exception 'Circle hosting authority required' using errcode = '42501';
  end if;

  select coalesce(nullif(btrim(display_name), ''), nullif(btrim(username::text), ''), 'FIFTHS creator')
  into creator_name
  from public.profiles
  where id = current_user_id;

  if char_length(btrim(p_title)) not between 5 and 120
     or char_length(btrim(p_summary)) not between 10 and 280
     or char_length(btrim(p_description)) not between 20 and 5000
     or char_length(btrim(p_deliverables)) not between 20 and 3000 then
    raise exception 'Invalid opportunity content' using errcode = '22023';
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
    deadline_at := p_response_deadline_local::timestamp at time zone p_timezone;
  exception when others then
    raise exception 'Invalid response deadline' using errcode = '22023';
  end;

  if deadline_at <= now() + interval '1 hour'
     or deadline_at > now() + interval '1 year' then
    raise exception 'Invalid response deadline' using errcode = '22023';
  end if;

  if p_estimated_minutes not between 15 and 1440
     or p_positions not between 1 and 25 then
    raise exception 'Invalid opportunity capacity or commitment' using errcode = '22023';
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

  if cardinality(coalesce(p_skill_ids, '{}'::uuid[])) not between 1 and 8
     or cardinality(coalesce(p_interest_ids, '{}'::uuid[])) > 8 then
    raise exception 'Invalid taxonomy selection' using errcode = '22023';
  end if;

  select count(distinct id) into requested_skill_count
  from unnest(coalesce(p_skill_ids, '{}'::uuid[])) as selected(id);
  select count(*) into active_skill_count
  from public.skills
  where active and id = any(coalesce(p_skill_ids, '{}'::uuid[]));

  select count(distinct id) into requested_interest_count
  from unnest(coalesce(p_interest_ids, '{}'::uuid[])) as selected(id);
  select count(*) into active_interest_count
  from public.interests
  where active and id = any(coalesce(p_interest_ids, '{}'::uuid[]));

  if requested_skill_count <> cardinality(p_skill_ids)
     or requested_skill_count <> active_skill_count
     or requested_interest_count <> cardinality(coalesce(p_interest_ids, '{}'::uuid[]))
     or requested_interest_count <> active_interest_count then
    raise exception 'Invalid taxonomy selection' using errcode = '22023';
  end if;

  insert into public.creator_opportunities (
    id, created_by, creator_display_name, circle_id, title, summary,
    description, deliverables, kind, format, location_label, response_deadline,
    timezone,
    estimated_minutes, positions, mode_id, minimum_energy, maximum_energy,
    stimulation_level, social_intensity
  ) values (
    opportunity_id, current_user_id, creator_name, p_circle_id, btrim(p_title),
    btrim(p_summary), btrim(p_description), btrim(p_deliverables), p_kind,
    p_format, nullif(btrim(p_location_label), ''), deadline_at, p_timezone,
    p_estimated_minutes, p_positions, p_mode_id, p_minimum_energy,
    p_maximum_energy, p_stimulation_level, p_social_intensity
  );

  insert into public.opportunity_skills (opportunity_id, skill_id)
  select opportunity_id, id from unnest(p_skill_ids) as selected(id);

  insert into public.opportunity_interests (opportunity_id, interest_id)
  select opportunity_id, id
  from unnest(coalesce(p_interest_ids, '{}'::uuid[])) as selected(id);

  return opportunity_id;
end;
$$;

create or replace function public.set_creator_opportunity_status(
  p_opportunity_id uuid,
  p_status public.creator_opportunity_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_opportunity public.creator_opportunities%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into current_opportunity
  from public.creator_opportunities
  where id = p_opportunity_id
  for update;

  if not found or not public.can_manage_creator_opportunity(p_opportunity_id) then
    raise exception 'Opportunity management denied' using errcode = '42501';
  end if;

  if p_status = 'published'
     and current_opportunity.status = 'draft'
     and current_opportunity.response_deadline > now() then
    update public.creator_opportunities
    set status = 'published', published_at = now()
    where id = p_opportunity_id;
  elsif p_status = 'closed'
        and current_opportunity.status = 'published' then
    update public.creator_opportunities
    set status = 'closed',
        close_reason = case
          when response_deadline <= now() then 'deadline'::public.creator_opportunity_close_reason
          else 'manual'::public.creator_opportunity_close_reason
        end,
        closed_at = now()
    where id = p_opportunity_id;
  elsif p_status = 'cancelled'
        and current_opportunity.status in ('draft', 'published', 'closed')
        and current_opportunity.accepted_count = 0
        and not exists (
          select 1 from public.opportunity_responses
          where opportunity_id = p_opportunity_id
            and status = 'completed'
        ) then
    update public.creator_opportunities
    set status = 'cancelled', close_reason = null, closed_at = now()
    where id = p_opportunity_id;
  else
    raise exception 'Invalid opportunity status transition' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.save_creator_opportunity(
  p_opportunity_id uuid,
  p_save boolean
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

  if p_save then
    if not public.can_view_creator_opportunity(p_opportunity_id)
       or not exists (
         select 1 from public.creator_opportunities
         where id = p_opportunity_id
           and status = 'published'
           and response_deadline > now()
       ) then
      raise exception 'Opportunity is not saveable' using errcode = '42501';
    end if;

    insert into public.saved_opportunities (opportunity_id, user_id)
    values (p_opportunity_id, auth.uid())
    on conflict (opportunity_id, user_id) do nothing;
  else
    delete from public.saved_opportunities
    where opportunity_id = p_opportunity_id and user_id = auth.uid();
  end if;
end;
$$;

create or replace function public.submit_opportunity_response(
  p_opportunity_id uuid,
  p_statement text,
  p_availability text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_opportunity public.creator_opportunities%rowtype;
  existing_response public.opportunity_responses%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if char_length(btrim(p_statement)) not between 20 and 2000
     or char_length(btrim(p_availability)) not between 10 and 500 then
    raise exception 'Invalid response content' using errcode = '22023';
  end if;

  select * into current_opportunity
  from public.creator_opportunities
  where id = p_opportunity_id
  for update;

  if not found
     or current_opportunity.status <> 'published'
     or current_opportunity.response_deadline <= now()
     or current_opportunity.accepted_count >= current_opportunity.positions
     or public.can_manage_creator_opportunity(p_opportunity_id)
     or not public.can_view_creator_opportunity(p_opportunity_id) then
    raise exception 'Opportunity is not accepting responses' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and onboarding_completed_at is not null
  ) then
    raise exception 'Onboarding required' using errcode = '42501';
  end if;

  select * into existing_response
  from public.opportunity_responses
  where opportunity_id = p_opportunity_id and user_id = auth.uid();

  if found and existing_response.status <> 'withdrawn' then
    raise exception 'Response already exists' using errcode = '23505';
  end if;

  insert into public.opportunity_responses (
    opportunity_id, user_id, statement, availability, status, submitted_at,
    accepted_at, declined_at, withdrawn_at, creator_confirmed_at,
    participant_confirmed_at, completed_at
  ) values (
    p_opportunity_id, auth.uid(), btrim(p_statement), btrim(p_availability),
    'submitted', now(), null, null, null, null, null, null
  )
  on conflict (opportunity_id, user_id) do update
  set statement = excluded.statement,
      availability = excluded.availability,
      status = 'submitted',
      submitted_at = now(),
      accepted_at = null,
      declined_at = null,
      withdrawn_at = null,
      creator_confirmed_at = null,
      participant_confirmed_at = null,
      completed_at = null;
end;
$$;

create or replace function public.withdraw_opportunity_response(p_opportunity_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_response public.opportunity_responses%rowtype;
  current_opportunity public.creator_opportunities%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into current_opportunity
  from public.creator_opportunities
  where id = p_opportunity_id
  for update;

  select * into current_response
  from public.opportunity_responses
  where opportunity_id = p_opportunity_id and user_id = auth.uid()
  for update;

  if not found or current_response.status not in ('submitted', 'accepted') then
    raise exception 'Response cannot be withdrawn' using errcode = '22023';
  end if;

  update public.opportunity_responses
  set status = 'withdrawn', withdrawn_at = now(), declined_at = null,
      creator_confirmed_at = null, participant_confirmed_at = null,
      completed_at = null
  where opportunity_id = p_opportunity_id and user_id = auth.uid();

  if current_response.status = 'accepted' then
    update public.creator_opportunities
    set accepted_count = greatest(accepted_count - 1, 0)
    where id = p_opportunity_id;

    if current_opportunity.status = 'closed'
       and current_opportunity.close_reason = 'filled'
       and current_opportunity.response_deadline > now() then
      update public.creator_opportunities
      set status = 'published', close_reason = null, closed_at = null
      where id = p_opportunity_id;
    end if;
  end if;
end;
$$;

create or replace function public.review_opportunity_response(
  p_opportunity_id uuid,
  p_user_id uuid,
  p_decision text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_opportunity public.creator_opportunities%rowtype;
  current_response public.opportunity_responses%rowtype;
  next_count integer;
begin
  if auth.uid() is null
     or not public.can_manage_creator_opportunity(p_opportunity_id) then
    raise exception 'Opportunity management denied' using errcode = '42501';
  end if;

  if p_decision not in ('accept', 'decline') then
    raise exception 'Invalid response decision' using errcode = '22023';
  end if;

  select * into current_opportunity
  from public.creator_opportunities
  where id = p_opportunity_id
  for update;

  select * into current_response
  from public.opportunity_responses
  where opportunity_id = p_opportunity_id and user_id = p_user_id
  for update;

  if not found or current_response.status <> 'submitted'
     or current_opportunity.status not in ('published', 'closed') then
    raise exception 'Response is not reviewable' using errcode = '22023';
  end if;

  if p_decision = 'accept' then
    if current_opportunity.accepted_count >= current_opportunity.positions then
      raise exception 'Opportunity is filled' using errcode = '22023';
    end if;

    next_count := current_opportunity.accepted_count + 1;
    update public.opportunity_responses
    set status = 'accepted', accepted_at = now(), declined_at = null
    where opportunity_id = p_opportunity_id and user_id = p_user_id;

    update public.creator_opportunities
    set accepted_count = next_count,
        status = case when next_count = positions then 'closed' else status end,
        close_reason = case when next_count = positions then 'filled' else close_reason end,
        closed_at = case when next_count = positions then now() else closed_at end
    where id = p_opportunity_id;
  else
    update public.opportunity_responses
    set status = 'declined', declined_at = now()
    where opportunity_id = p_opportunity_id and user_id = p_user_id;
  end if;
end;
$$;

create or replace function public.confirm_opportunity_completion(
  p_opportunity_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_response public.opportunity_responses%rowtype;
  manager_confirmation boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  manager_confirmation := public.can_manage_creator_opportunity(p_opportunity_id);
  if not manager_confirmation and p_user_id <> auth.uid() then
    raise exception 'Completion confirmation denied' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.creator_opportunities
    where id = p_opportunity_id and status = 'closed'
  ) then
    raise exception 'Close the opportunity before completion' using errcode = '22023';
  end if;

  select * into current_response
  from public.opportunity_responses
  where opportunity_id = p_opportunity_id and user_id = p_user_id
  for update;

  if not found or current_response.status not in ('accepted', 'completed') then
    raise exception 'Response is not completable' using errcode = '22023';
  end if;

  if p_user_id = auth.uid() then
    update public.opportunity_responses
    set participant_confirmed_at = coalesce(participant_confirmed_at, now())
    where opportunity_id = p_opportunity_id and user_id = p_user_id;
  elsif manager_confirmation then
    update public.opportunity_responses
    set creator_confirmed_at = coalesce(creator_confirmed_at, now())
    where opportunity_id = p_opportunity_id and user_id = p_user_id;
  end if;

  update public.opportunity_responses
  set status = 'completed', completed_at = now()
  where opportunity_id = p_opportunity_id
    and user_id = p_user_id
    and status = 'accepted'
    and creator_confirmed_at is not null
    and participant_confirmed_at is not null;

  if exists (
      select 1 from public.opportunity_responses
      where opportunity_id = p_opportunity_id and status = 'completed'
    ) and not exists (
      select 1 from public.opportunity_responses
      where opportunity_id = p_opportunity_id and status = 'accepted'
    ) then
    update public.creator_opportunities
    set status = 'completed', completed_at = now()
    where id = p_opportunity_id and status = 'closed';
  end if;
end;
$$;

create or replace function public.get_creator_opportunity_responses(p_opportunity_id uuid)
returns table (
  user_id uuid,
  display_name text,
  username text,
  statement text,
  availability text,
  response_status public.opportunity_response_status,
  submitted_at timestamptz,
  accepted_at timestamptz,
  creator_confirmed_at timestamptz,
  participant_confirmed_at timestamptz,
  completed_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null
     or not public.can_manage_creator_opportunity(p_opportunity_id) then
    raise exception 'Opportunity response access denied' using errcode = '42501';
  end if;

  return query
  select
    response.user_id,
    coalesce(profile.display_name, 'FIFTHS member'),
    profile.username::text,
    response.statement,
    response.availability,
    response.status,
    response.submitted_at,
    response.accepted_at,
    response.creator_confirmed_at,
    response.participant_confirmed_at,
    response.completed_at
  from public.opportunity_responses response
  join public.profiles profile on profile.id = response.user_id
  where response.opportunity_id = p_opportunity_id
  order by response.submitted_at, response.user_id;
end;
$$;

-- Prevent a Circle from being archived while it still owns a published Commons opportunity.
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
        )
        and not exists (
          select 1 from public.creator_opportunities
          where circle_id = p_circle_id and status = 'published'
        ) then
    update public.circles
    set status = 'archived'
    where id = p_circle_id;
  else
    raise exception 'Invalid Circle status transition' using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.create_creator_opportunity(
  uuid, text, text, text, text, public.creator_opportunity_kind,
  public.participation_format, text, text, text, integer, integer, uuid,
  integer, integer, public.pulse_stimulation_level,
  public.pulse_social_intensity, uuid[], uuid[]
) from public;
revoke all on function public.set_creator_opportunity_status(uuid, public.creator_opportunity_status) from public;
revoke all on function public.save_creator_opportunity(uuid, boolean) from public;
revoke all on function public.submit_opportunity_response(uuid, text, text) from public;
revoke all on function public.withdraw_opportunity_response(uuid) from public;
revoke all on function public.review_opportunity_response(uuid, uuid, text) from public;
revoke all on function public.confirm_opportunity_completion(uuid, uuid) from public;
revoke all on function public.get_creator_opportunity_responses(uuid) from public;

grant execute on function public.create_creator_opportunity(
  uuid, text, text, text, text, public.creator_opportunity_kind,
  public.participation_format, text, text, text, integer, integer, uuid,
  integer, integer, public.pulse_stimulation_level,
  public.pulse_social_intensity, uuid[], uuid[]
) to authenticated;
grant execute on function public.set_creator_opportunity_status(uuid, public.creator_opportunity_status) to authenticated;
grant execute on function public.save_creator_opportunity(uuid, boolean) to authenticated;
grant execute on function public.submit_opportunity_response(uuid, text, text) to authenticated;
grant execute on function public.withdraw_opportunity_response(uuid) to authenticated;
grant execute on function public.review_opportunity_response(uuid, uuid, text) to authenticated;
grant execute on function public.confirm_opportunity_completion(uuid, uuid) to authenticated;
grant execute on function public.get_creator_opportunity_responses(uuid) to authenticated;

alter table public.creator_opportunities enable row level security;
alter table public.opportunity_skills enable row level security;
alter table public.opportunity_interests enable row level security;
alter table public.opportunity_responses enable row level security;
alter table public.saved_opportunities enable row level security;

create policy "creator_opportunities_select_eligible"
on public.creator_opportunities for select
to authenticated
using (public.can_view_creator_opportunity(id));

create policy "opportunity_skills_select_eligible"
on public.opportunity_skills for select
to authenticated
using (public.can_view_creator_opportunity(opportunity_id));

create policy "opportunity_interests_select_eligible"
on public.opportunity_interests for select
to authenticated
using (public.can_view_creator_opportunity(opportunity_id));

create policy "opportunity_responses_select_own_or_manager"
on public.opportunity_responses for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.can_manage_creator_opportunity(opportunity_id)
);

create policy "saved_opportunities_select_own"
on public.saved_opportunities for select
to authenticated
using (user_id = (select auth.uid()));

revoke all on public.creator_opportunities from anon, authenticated;
revoke all on public.opportunity_skills from anon, authenticated;
revoke all on public.opportunity_interests from anon, authenticated;
revoke all on public.opportunity_responses from anon, authenticated;
revoke all on public.saved_opportunities from anon, authenticated;

grant usage on type
  public.creator_opportunity_kind,
  public.creator_opportunity_status,
  public.creator_opportunity_close_reason,
  public.opportunity_response_status
to authenticated;

grant select on public.creator_opportunities to authenticated;
grant select on public.opportunity_skills to authenticated;
grant select on public.opportunity_interests to authenticated;
grant select on public.opportunity_responses to authenticated;
grant select on public.saved_opportunities to authenticated;
