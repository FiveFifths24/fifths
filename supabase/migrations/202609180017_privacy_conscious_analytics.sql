create table public.product_analytics_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.profiles(id) on delete set null,
  event_name text not null,
  route text,
  entity_type text,
  entity_id uuid,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint product_analytics_event_name check (
    event_name in (
      'page_view',
      'account_created',
      'onboarding_completed',
      'tutorial_started',
      'tutorial_completed',
      'profile_customized',
      'pulse_check_in_completed',
      'session_viewed',
      'session_registered',
      'session_attended',
      'circle_viewed',
      'circle_joined',
      'opportunity_viewed',
      'opportunity_created',
      'opportunity_response_submitted',
      'collaboration_completed',
      'campaign_viewed',
      'campaign_application_submitted',
      'campaign_joined',
      'passport_credit_awarded',
      'email_preferences_updated'
    )
  ),
  constraint product_analytics_route check (
    route is null
    or (
      char_length(route) between 1 and 240
      and route ~ '^/[A-Za-z0-9/_-]*$'
    )
  ),
  constraint product_analytics_entity_type check (
    entity_type is null
    or entity_type in (
      'session',
      'circle',
      'opportunity',
      'campaign',
      'passport_entry'
    )
  ),
  constraint product_analytics_entity_pair check (
    (entity_type is null and entity_id is null)
    or (entity_type is not null and entity_id is not null)
  ),
  constraint product_analytics_properties_size check (
    octet_length(properties::text) <= 2048
  )
);

create index product_analytics_events_created_idx
  on public.product_analytics_events(created_at desc);
create index product_analytics_events_name_created_idx
  on public.product_analytics_events(event_name, created_at desc);
create index product_analytics_events_actor_created_idx
  on public.product_analytics_events(actor_user_id, created_at desc)
  where actor_user_id is not null;

alter table public.product_analytics_events enable row level security;

revoke all on public.product_analytics_events from public, anon, authenticated;

create or replace function public.record_product_analytics_event(
  p_event_name text,
  p_route text default null,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_properties jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  event_id bigint;
  normalized_route text := nullif(split_part(btrim(p_route), '?', 1), '');
  allowed_property_keys text[] := array[
    'source',
    'outcome',
    'feature',
    'step',
    'duration_bucket'
  ];
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_event_name not in (
    'page_view',
    'account_created',
    'onboarding_completed',
    'tutorial_started',
    'tutorial_completed',
    'profile_customized',
    'pulse_check_in_completed',
    'session_viewed',
    'session_registered',
    'session_attended',
    'circle_viewed',
    'circle_joined',
    'opportunity_viewed',
    'opportunity_created',
    'opportunity_response_submitted',
    'collaboration_completed',
    'campaign_viewed',
    'campaign_application_submitted',
    'campaign_joined',
    'passport_credit_awarded',
    'email_preferences_updated'
  ) then
    raise exception 'Unsupported analytics event' using errcode = '22023';
  end if;

  if normalized_route is not null and (
    char_length(normalized_route) > 240
    or normalized_route !~ '^/[A-Za-z0-9/_-]*$'
  ) then
    raise exception 'Invalid analytics route' using errcode = '22023';
  end if;

  if p_entity_type is not null and p_entity_type not in (
    'session',
    'circle',
    'opportunity',
    'campaign',
    'passport_entry'
  ) then
    raise exception 'Unsupported analytics entity' using errcode = '22023';
  end if;

  if (p_entity_type is null) <> (p_entity_id is null) then
    raise exception 'Analytics entity is incomplete' using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_properties, '{}'::jsonb)) <> 'object'
    or octet_length(coalesce(p_properties, '{}'::jsonb)::text) > 2048
    or exists (
      select 1
      from jsonb_object_keys(coalesce(p_properties, '{}'::jsonb)) key
      where key <> all(allowed_property_keys)
    )
    or exists (
      select 1
      from jsonb_each(coalesce(p_properties, '{}'::jsonb)) property
      where jsonb_typeof(property.value) not in (
        'string',
        'number',
        'boolean',
        'null'
      )
        or (
          jsonb_typeof(property.value) = 'string'
          and property.value #>> '{}' !~ '^[a-z0-9_-]{1,80}$'
        )
    )
  then
    raise exception 'Analytics properties are not allowed' using errcode = '22023';
  end if;

  if (
    select count(*)
    from public.product_analytics_events
    where actor_user_id = current_user_id
      and created_at > now() - interval '10 minutes'
  ) >= 120 then
    raise exception 'Analytics event rate limit reached' using errcode = '22023';
  end if;

  insert into public.product_analytics_events (
    actor_user_id,
    event_name,
    route,
    entity_type,
    entity_id,
    properties
  ) values (
    current_user_id,
    p_event_name,
    normalized_route,
    p_entity_type,
    p_entity_id,
    coalesce(p_properties, '{}'::jsonb)
  )
  returning id into event_id;

  return event_id;
end;
$$;

create or replace function private.prune_product_analytics_events(
  p_retention interval default interval '13 months'
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count bigint;
begin
  if p_retention < interval '30 days' then
    raise exception 'Analytics retention cannot be shorter than 30 days'
      using errcode = '22023';
  end if;

  delete from public.product_analytics_events
  where created_at < now() - p_retention;

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.record_product_analytics_event(
  text,
  text,
  text,
  uuid,
  jsonb
) from public, anon, authenticated;
grant execute on function public.record_product_analytics_event(
  text,
  text,
  text,
  uuid,
  jsonb
) to authenticated;

revoke all on function private.prune_product_analytics_events(interval)
  from public, anon, authenticated;

notify pgrst, 'reload schema';
