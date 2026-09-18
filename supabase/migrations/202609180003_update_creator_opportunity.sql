create or replace function public.update_creator_opportunity(
  p_opportunity_id uuid,
  p_circle_id uuid,
  p_title text,
  p_summary text,
  p_description text,
  p_deliverables text,
  p_kind public.creator_opportunity_kind,
  p_is_paid boolean,
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
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_opportunity public.creator_opportunities%rowtype;
  requested_skill_count integer;
  active_skill_count integer;
  requested_interest_count integer;
  active_interest_count integer;
  deadline_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  select *
  into current_opportunity
  from public.creator_opportunities
  where id = p_opportunity_id
  for update;

  if not found then
    raise exception 'Opportunity not found'
      using errcode = '22023';
  end if;

  if not public.can_manage_creator_opportunity(p_opportunity_id) then
    raise exception 'Opportunity management denied'
      using errcode = '42501';
  end if;

  -- Completed or cancelled records are historical product state.
  -- They should remain stable rather than being rewritten after the fact.
  if current_opportunity.status not in ('draft', 'published') then
    raise exception 'Opportunity can no longer be edited'
      using errcode = '22023';
  end if;

  -- Validate Circle association / creator authority.
  if p_circle_id is null then
    if current_opportunity.created_by <> auth.uid()
       and not public.has_role('platform_admin') then
      raise exception 'Creator authority required'
        using errcode = '42501';
    end if;
  elsif not public.can_host_circle(p_circle_id)
        or not exists (
          select 1
          from public.circles
          where id = p_circle_id
            and status <> 'archived'
        ) then
    raise exception 'Circle hosting authority required'
      using errcode = '42501';
  end if;

  if char_length(btrim(p_title)) not between 5 and 120
     or char_length(btrim(p_summary)) not between 10 and 280
     or char_length(btrim(p_description)) not between 20 and 5000
     or char_length(btrim(p_deliverables)) not between 20 and 3000 then
    raise exception 'Invalid opportunity content'
      using errcode = '22023';
  end if;

  if p_location_label is not null
     and char_length(btrim(p_location_label)) not between 2 and 120 then
    raise exception 'Invalid location label'
      using errcode = '22023';
  end if;

  if p_timezone is null
     or not exists (
       select 1
       from pg_catalog.pg_timezone_names
       where name = p_timezone
     ) then
    raise exception 'Invalid timezone'
      using errcode = '22023';
  end if;

  begin
    deadline_at :=
      p_response_deadline_local::timestamp at time zone p_timezone;
  exception
    when others then
      raise exception 'Invalid response deadline'
        using errcode = '22023';
  end;

  if deadline_at <= now() + interval '1 hour'
     or deadline_at > now() + interval '1 year' then
    raise exception 'Invalid response deadline'
      using errcode = '22023';
  end if;

  if p_estimated_minutes not between 15 and 1440
     or p_positions not between 1 and 25 then
    raise exception 'Invalid opportunity capacity or commitment'
      using errcode = '22023';
  end if;

  -- Never allow edits to shrink capacity below people already accepted.
  if p_positions < current_opportunity.accepted_count then
    raise exception 'Positions cannot be lower than accepted participants'
      using errcode = '22023';
  end if;

  if p_mode_id is null
     or not exists (
       select 1
       from public.modes
       where id = p_mode_id
         and active
     ) then
    raise exception 'Invalid mode'
      using errcode = '22023';
  end if;

  if p_minimum_energy not between 1 and 5
     or p_maximum_energy not between 1 and 5
     or p_minimum_energy > p_maximum_energy then
    raise exception 'Invalid energy range'
      using errcode = '22023';
  end if;

  if cardinality(coalesce(p_skill_ids, '{}'::uuid[])) not between 1 and 8
     or cardinality(coalesce(p_interest_ids, '{}'::uuid[])) > 8 then
    raise exception 'Invalid taxonomy selection'
      using errcode = '22023';
  end if;

  select count(distinct id)
  into requested_skill_count
  from unnest(
    coalesce(p_skill_ids, '{}'::uuid[])
  ) as selected(id);

  select count(*)
  into active_skill_count
  from public.skills
  where active
    and id = any(coalesce(p_skill_ids, '{}'::uuid[]));

  select count(distinct id)
  into requested_interest_count
  from unnest(
    coalesce(p_interest_ids, '{}'::uuid[])
  ) as selected(id);

  select count(*)
  into active_interest_count
  from public.interests
  where active
    and id = any(coalesce(p_interest_ids, '{}'::uuid[]));

  if requested_skill_count <>
       cardinality(coalesce(p_skill_ids, '{}'::uuid[]))
     or requested_skill_count <> active_skill_count
     or requested_interest_count <>
       cardinality(coalesce(p_interest_ids, '{}'::uuid[]))
     or requested_interest_count <> active_interest_count then
    raise exception 'Invalid taxonomy selection'
      using errcode = '22023';
  end if;

  update public.creator_opportunities
  set
    circle_id = p_circle_id,
    title = btrim(p_title),
    summary = btrim(p_summary),
    description = btrim(p_description),
    deliverables = btrim(p_deliverables),
    kind = p_kind,
    is_paid = p_is_paid,
    format = p_format,
    location_label = nullif(btrim(p_location_label), ''),
    response_deadline = deadline_at,
    timezone = p_timezone,
    estimated_minutes = p_estimated_minutes,
    positions = p_positions,
    mode_id = p_mode_id,
    minimum_energy = p_minimum_energy,
    maximum_energy = p_maximum_energy,
    stimulation_level = p_stimulation_level,
    social_intensity = p_social_intensity
  where id = p_opportunity_id;

  delete from public.opportunity_skills
  where opportunity_id = p_opportunity_id;

  insert into public.opportunity_skills (
    opportunity_id,
    skill_id
  )
  select p_opportunity_id, id
  from unnest(
    coalesce(p_skill_ids, '{}'::uuid[])
  ) as selected(id);

  delete from public.opportunity_interests
  where opportunity_id = p_opportunity_id;

  insert into public.opportunity_interests (
    opportunity_id,
    interest_id
  )
  select p_opportunity_id, id
  from unnest(
    coalesce(p_interest_ids, '{}'::uuid[])
  ) as selected(id);
end;
$$;

revoke all on function public.update_creator_opportunity(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  public.creator_opportunity_kind,
  boolean,
  public.participation_format,
  text,
  text,
  text,
  integer,
  integer,
  uuid,
  integer,
  integer,
  public.pulse_stimulation_level,
  public.pulse_social_intensity,
  uuid[],
  uuid[]
) from public;

grant execute on function public.update_creator_opportunity(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  public.creator_opportunity_kind,
  boolean,
  public.participation_format,
  text,
  text,
  text,
  integer,
  integer,
  uuid,
  integer,
  integer,
  public.pulse_stimulation_level,
  public.pulse_social_intensity,
  uuid[],
  uuid[]
) to authenticated;