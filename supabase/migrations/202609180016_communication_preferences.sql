create table public.communication_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  session_activity_email boolean not null default false,
  circle_activity_email boolean not null default false,
  commons_activity_email boolean not null default false,
  realm_activity_email boolean not null default false,
  passport_activity_email boolean not null default false,
  social_activity_email boolean not null default false,
  newsletter_email boolean not null default false,
  five_fifths_updates_email boolean not null default false,
  ehub_updates_email boolean not null default false,
  fundraising_email boolean not null default false,
  community_events_email boolean not null default false,
  feature_announcements_email boolean not null default false,
  marketing_consented_at timestamptz,
  marketing_consent_source text,
  marketing_revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint communication_preferences_consent_source check (
    marketing_consent_source is null
    or marketing_consent_source in (
      'signup',
      'onboarding',
      'account_settings',
      'newsletter_form'
    )
  )
);

alter table public.communication_preferences enable row level security;

create policy "communication_preferences_select_own"
on public.communication_preferences
for select
to authenticated
using (user_id = auth.uid());

revoke all on public.communication_preferences from public, anon, authenticated;
grant select on public.communication_preferences to authenticated;

create table private.communication_preference_audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  source text not null,
  previous_preferences jsonb not null,
  next_preferences jsonb not null,
  changed_at timestamptz not null default now()
);

create index communication_preference_audit_user_idx
  on private.communication_preference_audit_logs(user_id, changed_at desc);

revoke all on private.communication_preference_audit_logs
  from public, anon, authenticated;

create table private.email_delivery_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  communication_class text not null,
  template_key text not null,
  template_data jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  attempt_count integer not null default 0,
  available_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  delivered_at timestamptz,
  last_error_code text,
  constraint email_delivery_outbox_class check (
    communication_class in ('essential', 'activity', 'marketing')
  ),
  constraint email_delivery_outbox_status check (
    status in ('pending', 'processing', 'delivered', 'failed', 'cancelled')
  ),
  constraint email_delivery_outbox_attempts check (
    attempt_count between 0 and 10
  ),
  constraint email_delivery_outbox_template_key check (
    template_key ~ '^[a-z0-9_]{3,80}$'
  )
);

create index email_delivery_outbox_worker_idx
  on private.email_delivery_outbox(status, available_at)
  where status in ('pending', 'failed');

revoke all on private.email_delivery_outbox from public, anon, authenticated;

create or replace function public.update_communication_preferences(
  p_session_activity boolean,
  p_circle_activity boolean,
  p_commons_activity boolean,
  p_realm_activity boolean,
  p_passport_activity boolean,
  p_social_activity boolean,
  p_newsletter boolean,
  p_five_fifths_updates boolean,
  p_ehub_updates boolean,
  p_fundraising boolean,
  p_community_events boolean,
  p_feature_announcements boolean,
  p_source text default 'account_settings'
)
returns public.communication_preferences
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  previous_row public.communication_preferences;
  next_row public.communication_preferences;
  previous_marketing boolean := false;
  next_marketing boolean;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_source not in (
    'signup',
    'onboarding',
    'account_settings',
    'newsletter_form',
    'unsubscribe'
  ) then
    raise exception 'Unsupported consent source' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'communication-preferences:' || current_user_id::text,
      0
    )
  );

  select * into previous_row
  from public.communication_preferences
  where user_id = current_user_id;

  if found then
    previous_marketing := (
      previous_row.newsletter_email
      or previous_row.five_fifths_updates_email
      or previous_row.ehub_updates_email
      or previous_row.fundraising_email
      or previous_row.community_events_email
      or previous_row.feature_announcements_email
    );
  end if;

  next_marketing := (
    p_newsletter
    or p_five_fifths_updates
    or p_ehub_updates
    or p_fundraising
    or p_community_events
    or p_feature_announcements
  );

  insert into public.communication_preferences (
    user_id,
    session_activity_email,
    circle_activity_email,
    commons_activity_email,
    realm_activity_email,
    passport_activity_email,
    social_activity_email,
    newsletter_email,
    five_fifths_updates_email,
    ehub_updates_email,
    fundraising_email,
    community_events_email,
    feature_announcements_email,
    marketing_consented_at,
    marketing_consent_source,
    marketing_revoked_at
  ) values (
    current_user_id,
    p_session_activity,
    p_circle_activity,
    p_commons_activity,
    p_realm_activity,
    p_passport_activity,
    p_social_activity,
    p_newsletter,
    p_five_fifths_updates,
    p_ehub_updates,
    p_fundraising,
    p_community_events,
    p_feature_announcements,
    case when next_marketing then now() else null end,
    case when next_marketing and p_source <> 'unsubscribe' then p_source else null end,
    case when not next_marketing then now() else null end
  )
  on conflict (user_id) do update
  set session_activity_email = excluded.session_activity_email,
      circle_activity_email = excluded.circle_activity_email,
      commons_activity_email = excluded.commons_activity_email,
      realm_activity_email = excluded.realm_activity_email,
      passport_activity_email = excluded.passport_activity_email,
      social_activity_email = excluded.social_activity_email,
      newsletter_email = excluded.newsletter_email,
      five_fifths_updates_email = excluded.five_fifths_updates_email,
      ehub_updates_email = excluded.ehub_updates_email,
      fundraising_email = excluded.fundraising_email,
      community_events_email = excluded.community_events_email,
      feature_announcements_email = excluded.feature_announcements_email,
      marketing_consented_at = case
        when next_marketing and not previous_marketing then now()
        when next_marketing then communication_preferences.marketing_consented_at
        else null
      end,
      marketing_consent_source = case
        when next_marketing and not previous_marketing and p_source <> 'unsubscribe'
          then p_source
        when next_marketing then communication_preferences.marketing_consent_source
        else null
      end,
      marketing_revoked_at = case
        when previous_marketing and not next_marketing then now()
        when next_marketing then null
        else communication_preferences.marketing_revoked_at
      end,
      updated_at = now()
  returning * into next_row;

  insert into private.communication_preference_audit_logs (
    user_id,
    source,
    previous_preferences,
    next_preferences
  ) values (
    current_user_id,
    p_source,
    coalesce(to_jsonb(previous_row), '{}'::jsonb),
    to_jsonb(next_row)
  );

  return next_row;
end;
$$;

create or replace function public.unsubscribe_optional_email()
returns public.communication_preferences
language sql
security definer
set search_path = ''
as $$
  select public.update_communication_preferences(
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    'unsubscribe'
  );
$$;

revoke all on function public.update_communication_preferences(
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  text
) from public, anon, authenticated;
revoke all on function public.unsubscribe_optional_email()
  from public, anon, authenticated;

grant execute on function public.update_communication_preferences(
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  text
) to authenticated;
grant execute on function public.unsubscribe_optional_email()
  to authenticated;

notify pgrst, 'reload schema';
