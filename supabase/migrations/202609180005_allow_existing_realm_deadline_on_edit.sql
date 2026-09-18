create or replace function public.update_realm_campaign(
  p_campaign_id uuid,
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
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_campaign public.realm_campaigns%rowtype;
  deadline_at timestamptz;
  requested_interest_count integer;
  active_interest_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  select *
  into current_campaign
  from public.realm_campaigns
  where id = p_campaign_id
  for update;

  if not found then
    raise exception 'Campaign not found'
      using errcode = '22023';
  end if;

  if not public.can_manage_realm_campaign(p_campaign_id) then
    raise exception 'Campaign management denied'
      using errcode = '42501';
  end if;

  if current_campaign.status not in ('draft', 'recruiting') then
    raise exception 'Campaign can no longer be edited'
      using errcode = '22023';
  end if;

  if p_circle_id is not null
     and (
       not public.can_host_circle(p_circle_id)
       or not exists (
         select 1
         from public.circles
         where id = p_circle_id
           and status <> 'archived'
       )
     ) then
    raise exception 'Circle hosting authority required'
      using errcode = '42501';
  end if;

  if char_length(btrim(p_title)) not between 5 and 120
     or char_length(btrim(p_summary)) not between 10 and 280
     or char_length(btrim(p_premise)) not between 20 and 5000
     or char_length(btrim(p_genre)) not between 2 and 80
     or char_length(btrim(p_tone)) not between 2 and 160
     or char_length(btrim(p_safety_expectations)) not between 20 and 2000
     or char_length(btrim(p_schedule_summary)) not between 10 and 500 then
    raise exception 'Invalid campaign content'
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
      p_application_deadline_local::timestamp at time zone p_timezone;
  exception
    when others then
      raise exception 'Invalid application deadline'
        using errcode = '22023';
  end;

  if deadline_at is distinct from current_campaign.application_deadline
     and (
       deadline_at <= now() + interval '1 hour'
       or deadline_at > now() + interval '1 year'
     ) then
    raise exception 'Invalid application deadline'
      using errcode = '22023';
  end if;

  if p_estimated_session_minutes not between 30 and 480
     or p_player_capacity not between 1 and 12 then
    raise exception 'Invalid session duration or player capacity'
      using errcode = '22023';
  end if;

  if p_player_capacity < current_campaign.active_player_count then
    raise exception 'Player capacity cannot be lower than the active roster'
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

  if cardinality(coalesce(p_interest_ids, '{}'::uuid[])) not between 1 and 8 then
    raise exception 'Choose between one and eight interests'
      using errcode = '22023';
  end if;

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

  if requested_interest_count <>
       cardinality(coalesce(p_interest_ids, '{}'::uuid[]))
     or active_interest_count <> requested_interest_count then
    raise exception 'Invalid interest selection'
      using errcode = '22023';
  end if;

  update public.realm_campaigns
  set
    circle_id = p_circle_id,
    title = btrim(p_title),
    summary = btrim(p_summary),
    premise = btrim(p_premise),
    genre = btrim(p_genre),
    tone = btrim(p_tone),
    safety_expectations = btrim(p_safety_expectations),
    format = p_format,
    location_label = nullif(btrim(p_location_label), ''),
    schedule_summary = btrim(p_schedule_summary),
    timezone = p_timezone,
    estimated_session_minutes = p_estimated_session_minutes,
    application_deadline = deadline_at,
    player_capacity = p_player_capacity,
    experience_level = p_experience_level,
    mode_id = p_mode_id,
    minimum_energy = p_minimum_energy,
    maximum_energy = p_maximum_energy,
    stimulation_level = p_stimulation_level,
    social_intensity = p_social_intensity
  where id = p_campaign_id;

  delete from public.campaign_interests
  where campaign_id = p_campaign_id;

  insert into public.campaign_interests (
    campaign_id,
    interest_id
  )
  select p_campaign_id, id
  from unnest(
    coalesce(p_interest_ids, '{}'::uuid[])
  ) as selected(id);
end;
$$;

revoke all on function public.update_realm_campaign(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  public.participation_format,
  text,
  text,
  text,
  integer,
  text,
  integer,
  public.campaign_experience_level,
  uuid,
  integer,
  integer,
  public.pulse_stimulation_level,
  public.pulse_social_intensity,
  uuid[]
) from public;

grant execute on function public.update_realm_campaign(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  public.participation_format,
  text,
  text,
  text,
  integer,
  text,
  integer,
  public.campaign_experience_level,
  uuid,
  integer,
  integer,
  public.pulse_stimulation_level,
  public.pulse_social_intensity,
  uuid[]
) to authenticated;