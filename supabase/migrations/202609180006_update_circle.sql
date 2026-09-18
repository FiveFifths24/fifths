create or replace function public.update_circle(
  p_circle_id uuid,
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
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_circle public.circles%rowtype;
  requested_interest_count integer;
  active_interest_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  select *
  into current_circle
  from public.circles
  where id = p_circle_id
  for update;

  if not found then
    raise exception 'Circle not found'
      using errcode = '22023';
  end if;

  if current_circle.created_by <> auth.uid()
     and not public.has_role('platform_admin') then
    raise exception 'Circle update denied'
      using errcode = '42501';
  end if;

  if current_circle.status = 'archived' then
    raise exception 'Archived Circles cannot be edited'
      using errcode = '22023';
  end if;

  if char_length(btrim(p_name)) not between 3 and 40
     or char_length(btrim(p_slug)) not between 3 and 60
     or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
     or char_length(btrim(p_summary)) not between 10 and 240
     or char_length(btrim(p_description)) not between 20 and 4000
     or char_length(btrim(p_rules)) not between 20 and 4000 then
    raise exception 'Invalid Circle content'
      using errcode = '22023';
  end if;

  if p_visibility = 'private'
     and p_join_policy <> 'invite_only' then
    raise exception 'Private Circles are invite only'
      using errcode = '22023';
  end if;

  if p_location_label is not null
     and char_length(btrim(p_location_label)) not between 2 and 120 then
    raise exception 'Invalid location label'
      using errcode = '22023';
  end if;

  if p_minimum_energy not between 1 and 5
     or p_maximum_energy not between 1 and 5
     or p_minimum_energy > p_maximum_energy then
    raise exception 'Invalid Circle energy range'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.modes
    where id = p_mode_id
      and active = true
  ) then
    raise exception 'Invalid mode'
      using errcode = '22023';
  end if;

  requested_interest_count :=
    coalesce(array_length(p_interest_ids, 1), 0);

  if requested_interest_count <> 1 then
    raise exception 'Invalid interest selection'
      using errcode = '22023';
  end if;

  select count(*)
  into active_interest_count
  from public.interests
  where id = any(p_interest_ids)
    and active = true;

  if active_interest_count <> requested_interest_count then
    raise exception 'Invalid interest selection'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.circles
    where slug = lower(btrim(p_slug))
      and id <> p_circle_id
  ) then
    raise exception 'Circle slug already exists'
      using errcode = '23505';
  end if;

  update public.circles
  set
    name = btrim(p_name),
    slug = lower(btrim(p_slug)),
    summary = btrim(p_summary),
    description = btrim(p_description),
    rules = btrim(p_rules),
    visibility = p_visibility,
    join_policy = p_join_policy,
    format = p_format,
    location_label = nullif(btrim(p_location_label), ''),
    mode_id = p_mode_id,
    minimum_energy = p_minimum_energy,
    maximum_energy = p_maximum_energy,
    stimulation_level = p_stimulation_level,
    social_intensity = p_social_intensity,
    updated_at = now()
  where id = p_circle_id;

  delete from public.circle_interests
  where circle_id = p_circle_id;

  insert into public.circle_interests (
    circle_id,
    interest_id
  )
  select
    p_circle_id,
    interest_id
  from unnest(p_interest_ids) as selected(interest_id);
end;
$$;

revoke all on function public.update_circle(
  uuid,
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

grant execute on function public.update_circle(
  uuid,
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

notify pgrst, 'reload schema';