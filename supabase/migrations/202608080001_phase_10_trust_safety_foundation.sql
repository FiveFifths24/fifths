-- Phase 10: private feedback, structured reports, in-app notifications,
-- restricted moderation review, and audited platform-admin decisions.

create type public.feedback_area as enum (
  'platform',
  'pulse',
  'sessions',
  'circles',
  'commons',
  'realm',
  'passport',
  'accessibility',
  'safety'
);
create type public.feedback_status as enum ('submitted', 'reviewed', 'closed');
create type public.report_target_type as enum (
  'member',
  'session',
  'circle',
  'opportunity',
  'campaign',
  'platform'
);
create type public.report_category as enum (
  'harassment',
  'hate_or_discrimination',
  'threat_or_violence',
  'sexual_content',
  'spam_or_fraud',
  'privacy',
  'copyright_or_proprietary_content',
  'other'
);
create type public.report_status as enum (
  'submitted',
  'reviewing',
  'escalated',
  'resolved',
  'dismissed'
);
create type public.notification_kind as enum (
  'report_received',
  'report_updated',
  'circle_invitation',
  'commons_response',
  'realm_application',
  'passport_activity',
  'system'
);

create table public.member_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  area public.feedback_area not null,
  message text not null,
  consent_to_contact boolean not null default false,
  status public.feedback_status not null default 'submitted',
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_feedback_message_length check (
    char_length(btrim(message)) between 20 and 2000
  ),
  constraint member_feedback_review_lifecycle check (
    (status = 'submitted' and reviewed_by is null and reviewed_at is null)
    or (status in ('reviewed', 'closed') and reviewed_by is not null and reviewed_at is not null)
  )
);

create trigger member_feedback_set_updated_at
before update on public.member_feedback
for each row execute function public.set_updated_at();

create index member_feedback_user_created_idx
on public.member_feedback (user_id, created_at desc);
create index member_feedback_admin_queue_idx
on public.member_feedback (status, created_at asc);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.report_target_type not null,
  category public.report_category not null,
  summary text not null,
  details text not null,
  context_url text,
  status public.report_status not null default 'submitted',
  assigned_to uuid references auth.users (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reports_summary_length check (
    char_length(btrim(summary)) between 10 and 160
  ),
  constraint reports_details_length check (
    char_length(btrim(details)) between 30 and 2000
  ),
  constraint reports_context_url check (
    context_url is null
    or (
      char_length(context_url) between 1 and 300
      and context_url ~ '^/[A-Za-z0-9/_?=&%#.-]*$'
      and context_url !~ '^//'
    )
  ),
  constraint reports_resolution_lifecycle check (
    (
      status in ('submitted', 'reviewing', 'escalated')
      and resolved_at is null
    )
    or (
      status in ('resolved', 'dismissed')
      and resolved_at is not null
    )
  )
);

create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

create index reports_reporter_created_idx
on public.reports (reporter_user_id, created_at desc);
create index reports_moderation_queue_idx
on public.reports (status, created_at asc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.notification_kind not null,
  title text not null,
  body text not null,
  action_url text,
  dedupe_key text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_title_length check (
    char_length(btrim(title)) between 3 and 100
  ),
  constraint notifications_body_length check (
    char_length(btrim(body)) between 3 and 300
  ),
  constraint notifications_action_url check (
    action_url is null
    or (
      char_length(action_url) between 1 and 300
      and action_url ~ '^/[A-Za-z0-9/_?=&%#.-]*$'
      and action_url !~ '^//'
    )
  ),
  constraint notifications_dedupe_key_length check (
    dedupe_key is null or char_length(dedupe_key) between 3 and 200
  ),
  unique (user_id, dedupe_key)
);

create index notifications_user_created_idx
on public.notifications (user_id, created_at desc);
create index notifications_user_unread_idx
on public.notifications (user_id, read_at, created_at desc);

create table private.report_audit_logs (
  id bigint generated always as identity primary key,
  report_id uuid not null,
  previous_status public.report_status,
  new_status public.report_status not null,
  actor_user_id uuid,
  note text,
  occurred_at timestamptz not null default now()
);

create table private.feedback_audit_logs (
  id bigint generated always as identity primary key,
  feedback_id uuid not null,
  previous_status public.feedback_status,
  new_status public.feedback_status not null,
  actor_user_id uuid,
  occurred_at timestamptz not null default now()
);

revoke all on private.report_audit_logs from public, anon, authenticated;
revoke all on private.feedback_audit_logs from public, anon, authenticated;

create or replace function private.audit_report_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.report_audit_logs (
    report_id,
    previous_status,
    new_status,
    actor_user_id,
    note
  ) values (
    new.id,
    case when tg_op = 'UPDATE' then old.status else null end,
    new.status,
    auth.uid(),
    case
      when tg_op = 'UPDATE'
        then nullif(current_setting('app.moderation_note', true), '')
      else null
    end
  );
  return new;
end;
$$;

create trigger reports_audit_change
after insert or update of status on public.reports
for each row execute function private.audit_report_change();

revoke all on function private.audit_report_change() from public;

create or replace function private.audit_feedback_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.feedback_audit_logs (
    feedback_id,
    previous_status,
    new_status,
    actor_user_id
  ) values (
    new.id,
    case when tg_op = 'UPDATE' then old.status else null end,
    new.status,
    auth.uid()
  );
  return new;
end;
$$;

create trigger feedback_audit_change
after insert or update of status on public.member_feedback
for each row execute function private.audit_feedback_change();

revoke all on function private.audit_feedback_change() from public;

create or replace function private.issue_notification(
  p_user_id uuid,
  p_kind public.notification_kind,
  p_title text,
  p_body text,
  p_action_url text,
  p_dedupe_key text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  notification_id uuid;
begin
  insert into public.notifications (
    user_id,
    kind,
    title,
    body,
    action_url,
    dedupe_key
  ) values (
    p_user_id,
    p_kind,
    btrim(p_title),
    btrim(p_body),
    p_action_url,
    p_dedupe_key
  )
  on conflict (user_id, dedupe_key) do nothing
  returning id into notification_id;

  return notification_id;
end;
$$;

revoke all on function private.issue_notification(
  uuid,
  public.notification_kind,
  text,
  text,
  text,
  text
) from public;

create or replace function public.submit_feedback(
  p_area public.feedback_area,
  p_message text,
  p_consent_to_contact boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  feedback_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if char_length(btrim(p_message)) not between 20 and 2000 then
    raise exception 'Feedback must be between 20 and 2,000 characters'
      using errcode = '22023';
  end if;
  if (
    select count(*) from public.member_feedback
    where user_id = current_user_id
      and created_at > now() - interval '24 hours'
  ) >= 5 then
    raise exception 'Feedback submission limit reached' using errcode = '22023';
  end if;

  insert into public.member_feedback (user_id, area, message, consent_to_contact)
  values (current_user_id, p_area, btrim(p_message), p_consent_to_contact)
  returning id into feedback_id;

  return feedback_id;
end;
$$;

revoke all on function public.submit_feedback(
  public.feedback_area,
  text,
  boolean
) from public;
grant execute on function public.submit_feedback(
  public.feedback_area,
  text,
  boolean
) to authenticated;

create or replace function public.submit_report(
  p_target_type public.report_target_type,
  p_category public.report_category,
  p_summary text,
  p_details text,
  p_context_url text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  report_id uuid;
  normalized_url text := nullif(btrim(p_context_url), '');
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if char_length(btrim(p_summary)) not between 10 and 160
     or char_length(btrim(p_details)) not between 30 and 2000 then
    raise exception 'Invalid report details' using errcode = '22023';
  end if;
  if normalized_url is not null and (
    char_length(normalized_url) > 300
    or normalized_url !~ '^/[A-Za-z0-9/_?=&%#.-]*$'
    or normalized_url ~ '^//'
  ) then
    raise exception 'Context must be a FIFTHS path' using errcode = '22023';
  end if;
  if (
    select count(*) from public.reports
    where reporter_user_id = current_user_id
      and created_at > now() - interval '24 hours'
  ) >= 5 then
    raise exception 'Report submission limit reached' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.reports
    where reporter_user_id = current_user_id
      and target_type = p_target_type
      and category = p_category
      and coalesce(context_url, '') = coalesce(normalized_url, '')
      and status in ('submitted', 'reviewing', 'escalated')
      and created_at > now() - interval '24 hours'
  ) then
    raise exception 'A matching active report already exists' using errcode = '23505';
  end if;

  insert into public.reports (
    reporter_user_id,
    target_type,
    category,
    summary,
    details,
    context_url
  ) values (
    current_user_id,
    p_target_type,
    p_category,
    btrim(p_summary),
    btrim(p_details),
    normalized_url
  )
  returning id into report_id;

  perform private.issue_notification(
    current_user_id,
    'report_received',
    'Safety report received',
    'Your report is private and has entered the restricted review queue.',
    '/home/safety',
    'report:' || report_id::text || ':received'
  );

  return report_id;
end;
$$;

revoke all on function public.submit_report(
  public.report_target_type,
  public.report_category,
  text,
  text,
  text
) from public;
grant execute on function public.submit_report(
  public.report_target_type,
  public.report_category,
  text,
  text,
  text
) to authenticated;

create or replace function public.review_report(
  p_report_id uuid,
  p_status public.report_status,
  p_note text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  is_moderator boolean := public.has_role('moderator');
  is_admin boolean := public.has_role('platform_admin');
  current_status public.report_status;
  normalized_note text := nullif(btrim(p_note), '');
begin
  if auth.uid() is null or not (is_moderator or is_admin) then
    raise exception 'Moderation review denied' using errcode = '42501';
  end if;
  if p_status not in ('reviewing', 'escalated', 'resolved', 'dismissed') then
    raise exception 'Invalid moderation status' using errcode = '22023';
  end if;
  if not is_admin and p_status not in ('reviewing', 'escalated') then
    raise exception 'Final decisions require a platform administrator'
      using errcode = '42501';
  end if;
  if p_status in ('escalated', 'resolved', 'dismissed') and (
    normalized_note is null or char_length(normalized_note) not between 10 and 1000
  ) then
    raise exception 'A review note between 10 and 1,000 characters is required'
      using errcode = '22023';
  end if;

  select status into current_status
  from public.reports
  where id = p_report_id
  for update;
  if current_status is null then
    raise exception 'Report not found' using errcode = '22023';
  end if;
  if current_status in ('resolved', 'dismissed') then
    raise exception 'Final reports cannot be reopened in Phase 10'
      using errcode = '22023';
  end if;

  perform set_config(
    'app.moderation_note',
    coalesce(normalized_note, ''),
    true
  );

  update public.reports
  set
    status = p_status,
    assigned_to = case when p_status = 'reviewing' then auth.uid() else assigned_to end,
    resolved_at = case
      when p_status in ('resolved', 'dismissed') then now()
      else null
    end
  where id = p_report_id;
end;
$$;

revoke all on function public.review_report(uuid, public.report_status, text)
from public;
grant execute on function public.review_report(
  uuid,
  public.report_status,
  text
) to authenticated;

create or replace function public.review_feedback(
  p_feedback_id uuid,
  p_status public.feedback_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.has_role('platform_admin') then
    raise exception 'Feedback review denied' using errcode = '42501';
  end if;
  if p_status not in ('reviewed', 'closed') then
    raise exception 'Invalid feedback status' using errcode = '22023';
  end if;

  update public.member_feedback
  set
    status = p_status,
    reviewed_by = auth.uid(),
    reviewed_at = now()
  where id = p_feedback_id
    and status <> 'closed';

  if not found then
    raise exception 'Open feedback not found' using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.review_feedback(uuid, public.feedback_status)
from public;
grant execute on function public.review_feedback(
  uuid,
  public.feedback_status
) to authenticated;

create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.notifications
  set read_at = coalesce(read_at, now())
  where id = p_notification_id
    and user_id = auth.uid();
$$;

create or replace function public.mark_all_notifications_read()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.notifications
  set read_at = now()
  where user_id = auth.uid()
    and read_at is null;
$$;

revoke all on function public.mark_notification_read(uuid) from public;
revoke all on function public.mark_all_notifications_read() from public;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;

create or replace function private.notify_report_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status is distinct from new.status then
    perform private.issue_notification(
      new.reporter_user_id,
      'report_updated',
      'Safety report updated',
      case new.status
        when 'reviewing' then 'A moderator is reviewing your private report.'
        when 'escalated' then 'Your private report was escalated for platform review.'
        when 'resolved' then 'Your private report review is complete.'
        else 'Your private report review is closed.'
      end,
      '/home/safety',
      'report:' || new.id::text || ':' || new.status::text || ':' || extract(epoch from new.updated_at)::text
    );
  end if;
  return new;
end;
$$;

create trigger report_status_notify_reporter
after update of status on public.reports
for each row execute function private.notify_report_status_change();

revoke all on function private.notify_report_status_change() from public;

create or replace function private.notify_circle_invitation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  circle_name text;
begin
  if new.status = 'invited'
     and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    select name into circle_name from public.circles where id = new.circle_id;
    perform private.issue_notification(
      new.user_id,
      'circle_invitation',
      'Circle invitation',
      'You were invited to ' || circle_name || '.',
      '/home/circles/memberships',
      'circle:' || new.circle_id::text || ':invitation:' || extract(epoch from new.updated_at)::text
    );
  end if;
  return new;
end;
$$;

create trigger circle_invitation_notify_member
after insert or update of status on public.circle_members
for each row execute function private.notify_circle_invitation();

revoke all on function private.notify_circle_invitation() from public;

create or replace function private.notify_opportunity_response_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  opportunity_title text;
begin
  if new.status in ('accepted', 'declined', 'completed')
     and old.status is distinct from new.status then
    select title into opportunity_title
    from public.creator_opportunities where id = new.opportunity_id;
    perform private.issue_notification(
      new.user_id,
      'commons_response',
      'Commons response updated',
      opportunity_title || ' is now ' || new.status::text || '.',
      '/home/commons/responses',
      'opportunity:' || new.opportunity_id::text || ':' || new.status::text || ':' || extract(epoch from new.updated_at)::text
    );
  end if;
  return new;
end;
$$;

create trigger opportunity_response_notify_member
after update of status on public.opportunity_responses
for each row execute function private.notify_opportunity_response_status();

revoke all on function private.notify_opportunity_response_status() from public;

create or replace function private.notify_campaign_application_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  campaign_title text;
begin
  if new.status in ('accepted', 'declined')
     and old.status is distinct from new.status then
    select title into campaign_title
    from public.realm_campaigns where id = new.campaign_id;
    perform private.issue_notification(
      new.user_id,
      'realm_application',
      'Realm application updated',
      campaign_title || ' is now ' || new.status::text || '.',
      '/home/realm/applications',
      'campaign:' || new.campaign_id::text || ':application:' || new.status::text || ':' || extract(epoch from new.updated_at)::text
    );
  end if;
  return new;
end;
$$;

create trigger campaign_application_notify_member
after update of status on public.campaign_applications
for each row execute function private.notify_campaign_application_status();

revoke all on function private.notify_campaign_application_status() from public;

create or replace function private.notify_passport_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    perform private.issue_notification(
      new.user_id,
      'passport_activity',
      case new.status when 'verified' then 'Passport activity verified' else 'Passport activity corrected' end,
      new.source_title || case new.status when 'verified' then ' was added to your Passport.' else ' no longer counts as verified.' end,
      '/home/passport',
      'passport:' || new.id::text || ':' || new.status::text || ':' || extract(epoch from new.updated_at)::text
    );
  end if;
  return new;
end;
$$;

create trigger passport_change_notify_member
after insert or update of status on public.passport_entries
for each row execute function private.notify_passport_change();

revoke all on function private.notify_passport_change() from public;

alter table public.member_feedback enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;

create policy "member_feedback_select_own_or_admin"
on public.member_feedback for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.has_role('platform_admin')
);

create policy "reports_select_own_or_reviewer"
on public.reports for select
to authenticated
using (
  reporter_user_id = (select auth.uid())
  or public.has_role('moderator')
  or public.has_role('platform_admin')
);

create policy "notifications_select_own"
on public.notifications for select
to authenticated
using (user_id = (select auth.uid()));

revoke all on public.member_feedback from anon, authenticated;
revoke all on public.reports from anon, authenticated;
revoke all on public.notifications from anon, authenticated;
grant select on public.member_feedback to authenticated;
grant select on public.reports to authenticated;
grant select on public.notifications to authenticated;
grant usage on type
  public.feedback_area,
  public.feedback_status,
  public.report_target_type,
  public.report_category,
  public.report_status,
  public.notification_kind
to authenticated;
