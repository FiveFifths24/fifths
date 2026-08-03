-- Phase 9: private, verified Passport activity and duplicate prevention.
-- Entries are issued only from trusted product state; members cannot self-award.

create type public.passport_activity_kind as enum (
  'attended_session',
  'hosted_session',
  'completed_opportunity',
  'led_opportunity',
  'completed_campaign',
  'led_campaign'
);

create type public.passport_source_module as enum (
  'sessions',
  'circles',
  'commons',
  'realm'
);

create type public.passport_entry_status as enum ('verified', 'revoked');
create type public.passport_revocation_kind as enum (
  'source_correction',
  'administrative'
);

create table public.passport_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  activity_kind public.passport_activity_kind not null,
  source_module public.passport_source_module not null,
  source_record_id uuid not null,
  source_title text not null,
  occurred_at timestamptz not null,
  status public.passport_entry_status not null default 'verified',
  verified_at timestamptz not null default now(),
  verified_by uuid references auth.users (id) on delete set null,
  revoked_at timestamptz,
  revoked_by uuid references auth.users (id) on delete set null,
  revocation_kind public.passport_revocation_kind,
  revocation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint passport_entries_source_title_length check (
    char_length(btrim(source_title)) between 3 and 160
  ),
  constraint passport_entries_revocation_reason_length check (
    revocation_reason is null
    or char_length(btrim(revocation_reason)) between 10 and 500
  ),
  constraint passport_entries_lifecycle check (
    (
      status = 'verified'
      and revoked_at is null
      and revoked_by is null
      and revocation_kind is null
      and revocation_reason is null
    )
    or (
      status = 'revoked'
      and revoked_at is not null
      and revocation_kind is not null
      and revocation_reason is not null
    )
  ),
  unique (user_id, activity_kind, source_record_id)
);

create trigger passport_entries_set_updated_at
before update on public.passport_entries
for each row execute function public.set_updated_at();

create index passport_entries_user_activity_idx
on public.passport_entries (user_id, status, occurred_at desc, id);

create index passport_entries_source_idx
on public.passport_entries (source_module, source_record_id);

create table private.passport_entry_audit_logs (
  id bigint generated always as identity primary key,
  passport_entry_id uuid not null,
  user_id uuid not null,
  previous_status public.passport_entry_status,
  new_status public.passport_entry_status not null,
  actor_user_id uuid,
  reason text,
  occurred_at timestamptz not null default now()
);

revoke all on private.passport_entry_audit_logs from public, anon, authenticated;

create or replace function private.audit_passport_entry_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.passport_entry_audit_logs (
    passport_entry_id,
    user_id,
    previous_status,
    new_status,
    actor_user_id,
    reason
  ) values (
    new.id,
    new.user_id,
    case when tg_op = 'UPDATE' then old.status else null end,
    new.status,
    auth.uid(),
    new.revocation_reason
  );
  return new;
end;
$$;

create trigger passport_entry_audit_change
after insert or update on public.passport_entries
for each row execute function private.audit_passport_entry_change();

revoke all on function private.audit_passport_entry_change() from public;

create or replace function private.issue_passport_entry(
  p_user_id uuid,
  p_activity_kind public.passport_activity_kind,
  p_source_module public.passport_source_module,
  p_source_record_id uuid,
  p_source_title text,
  p_occurred_at timestamptz,
  p_verified_by uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  entry_id uuid;
begin
  insert into public.passport_entries (
    user_id,
    activity_kind,
    source_module,
    source_record_id,
    source_title,
    occurred_at,
    verified_by
  ) values (
    p_user_id,
    p_activity_kind,
    p_source_module,
    p_source_record_id,
    btrim(p_source_title),
    p_occurred_at,
    p_verified_by
  )
  on conflict (user_id, activity_kind, source_record_id) do update
  set
    source_module = excluded.source_module,
    source_title = excluded.source_title,
    occurred_at = excluded.occurred_at,
    status = 'verified',
    verified_at = now(),
    verified_by = excluded.verified_by,
    revoked_at = null,
    revoked_by = null,
    revocation_kind = null,
    revocation_reason = null
  where passport_entries.status = 'revoked'
    and passport_entries.revocation_kind = 'source_correction'
  returning id into entry_id;

  if entry_id is null then
    select id into entry_id
    from public.passport_entries
    where user_id = p_user_id
      and activity_kind = p_activity_kind
      and source_record_id = p_source_record_id;
  end if;

  return entry_id;
end;
$$;

create or replace function private.revoke_passport_source(
  p_user_id uuid,
  p_activity_kind public.passport_activity_kind,
  p_source_record_id uuid,
  p_reason text
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.passport_entries
  set
    status = 'revoked',
    revoked_at = now(),
    revoked_by = auth.uid(),
    revocation_kind = 'source_correction',
    revocation_reason = btrim(p_reason)
  where user_id = p_user_id
    and activity_kind = p_activity_kind
    and source_record_id = p_source_record_id
    and status = 'verified';
$$;

revoke all on function private.issue_passport_entry(
  uuid,
  public.passport_activity_kind,
  public.passport_source_module,
  uuid,
  text,
  timestamptz,
  uuid
) from public;
revoke all on function private.revoke_passport_source(
  uuid,
  public.passport_activity_kind,
  uuid,
  text
) from public;

create or replace function private.passport_module_for_session(
  p_source_module public.session_source_module
)
returns public.passport_source_module
language sql
immutable
set search_path = ''
as $$
  select case p_source_module
    when 'circles' then 'circles'::public.passport_source_module
    when 'commons' then 'commons'::public.passport_source_module
    when 'realm' then 'realm'::public.passport_source_module
    else 'sessions'::public.passport_source_module
  end;
$$;

revoke all on function private.passport_module_for_session(
  public.session_source_module
) from public;

create or replace function private.sync_session_host_passport(
  p_session_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  source_session public.sessions%rowtype;
begin
  select * into source_session
  from public.sessions
  where id = p_session_id;

  if source_session.status = 'completed'
     and exists (
       select 1
       from public.attendance_records attendance
       where attendance.session_id = source_session.id
         and attendance.user_id <> source_session.host_user_id
         and attendance.status = 'attended'
     ) then
    perform private.issue_passport_entry(
      source_session.host_user_id,
      'hosted_session',
      private.passport_module_for_session(source_session.source_module),
      source_session.id,
      source_session.title,
      source_session.ends_at,
      auth.uid()
    );
  else
    perform private.revoke_passport_source(
      source_session.host_user_id,
      'hosted_session',
      source_session.id,
      'Session hosting no longer has a verified non-host attendee.'
    );
  end if;
end;
$$;

revoke all on function private.sync_session_host_passport(uuid) from public;

create or replace function private.sync_session_attendance_passport()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  source_session public.sessions%rowtype;
begin
  select * into source_session
  from public.sessions
  where id = new.session_id;

  if new.status = 'attended' then
    perform private.issue_passport_entry(
      new.user_id,
      'attended_session',
      private.passport_module_for_session(source_session.source_module),
      new.session_id,
      source_session.title,
      source_session.starts_at,
      new.marked_by
    );
  else
    perform private.revoke_passport_source(
      new.user_id,
      'attended_session',
      new.session_id,
      'Attendance verification was corrected by an authorized Session manager.'
    );
  end if;

  perform private.sync_session_host_passport(new.session_id);

  return new;
end;
$$;

create trigger session_attendance_sync_passport
after insert or update of status on public.attendance_records
for each row execute function private.sync_session_attendance_passport();

revoke all on function private.sync_session_attendance_passport() from public;

create or replace function private.sync_session_completion_passport()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  attended record;
begin
  if new.status = 'completed' and old.status is distinct from new.status then
    for attended in
      select attendance.user_id, attendance.marked_by
      from public.attendance_records attendance
      where attendance.session_id = new.id
        and attendance.status = 'attended'
    loop
      perform private.issue_passport_entry(
        attended.user_id,
        'attended_session',
        private.passport_module_for_session(new.source_module),
        new.id,
        new.title,
        new.starts_at,
        attended.marked_by
      );
    end loop;

    perform private.sync_session_host_passport(new.id);
  end if;

  return new;
end;
$$;

create trigger session_completion_sync_passport
after update of status on public.sessions
for each row execute function private.sync_session_completion_passport();

revoke all on function private.sync_session_completion_passport() from public;

create or replace function private.sync_opportunity_response_passport()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  source_opportunity public.creator_opportunities%rowtype;
begin
  if new.status = 'completed' and old.status is distinct from new.status then
    select * into source_opportunity
    from public.creator_opportunities
    where id = new.opportunity_id;

    perform private.issue_passport_entry(
      new.user_id,
      'completed_opportunity',
      'commons',
      new.opportunity_id,
      source_opportunity.title,
      new.completed_at,
      auth.uid()
    );
  end if;

  return new;
end;
$$;

create trigger opportunity_response_sync_passport
after update of status on public.opportunity_responses
for each row execute function private.sync_opportunity_response_passport();

revoke all on function private.sync_opportunity_response_passport() from public;

create or replace function private.sync_opportunity_completion_passport()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'completed' and old.status is distinct from new.status then
    perform private.issue_passport_entry(
      new.created_by,
      'led_opportunity',
      'commons',
      new.id,
      new.title,
      new.completed_at,
      auth.uid()
    );
  end if;

  return new;
end;
$$;

create trigger opportunity_completion_sync_passport
after update of status on public.creator_opportunities
for each row execute function private.sync_opportunity_completion_passport();

revoke all on function private.sync_opportunity_completion_passport() from public;

create or replace function private.sync_campaign_completion_passport()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  member record;
begin
  if new.status = 'completed' and old.status is distinct from new.status then
    for member in
      select membership.user_id, membership.role
      from public.campaign_members membership
      where membership.campaign_id = new.id
        and membership.status = 'active'
    loop
      perform private.issue_passport_entry(
        member.user_id,
        case member.role
          when 'game_master' then 'led_campaign'::public.passport_activity_kind
          else 'completed_campaign'::public.passport_activity_kind
        end,
        'realm',
        new.id,
        new.title,
        new.completed_at,
        auth.uid()
      );
    end loop;
  end if;

  return new;
end;
$$;

create trigger campaign_completion_sync_passport
after update of status on public.realm_campaigns
for each row execute function private.sync_campaign_completion_passport();

revoke all on function private.sync_campaign_completion_passport() from public;

create or replace function public.revoke_passport_entry(
  p_entry_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.has_role('platform_admin') then
    raise exception 'Passport correction denied' using errcode = '42501';
  end if;

  if char_length(btrim(p_reason)) not between 10 and 500 then
    raise exception 'A correction reason between 10 and 500 characters is required'
      using errcode = '22023';
  end if;

  update public.passport_entries
  set
    status = 'revoked',
    revoked_at = now(),
    revoked_by = auth.uid(),
    revocation_kind = 'administrative',
    revocation_reason = btrim(p_reason)
  where id = p_entry_id
    and status = 'verified';

  if not found then
    raise exception 'Verified Passport entry not found' using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.revoke_passport_entry(uuid, text) from public;
grant execute on function public.revoke_passport_entry(uuid, text) to authenticated;

-- Backfill verified source state that may predate this migration. The same
-- unique source identity used by live triggers makes this safe to run once.
select private.issue_passport_entry(
  attendance.user_id,
  'attended_session',
  private.passport_module_for_session(session.source_module),
  session.id,
  session.title,
  session.starts_at,
  attendance.marked_by
)
from public.attendance_records attendance
join public.sessions session on session.id = attendance.session_id
where attendance.status = 'attended';

select private.issue_passport_entry(
  session.host_user_id,
  'hosted_session',
  private.passport_module_for_session(session.source_module),
  session.id,
  session.title,
  session.ends_at,
  null
)
from public.sessions session
where session.status = 'completed'
  and exists (
    select 1
    from public.attendance_records attendance
    where attendance.session_id = session.id
      and attendance.user_id <> session.host_user_id
      and attendance.status = 'attended'
  );

select private.issue_passport_entry(
  response.user_id,
  'completed_opportunity',
  'commons',
  opportunity.id,
  opportunity.title,
  response.completed_at,
  null
)
from public.opportunity_responses response
join public.creator_opportunities opportunity
  on opportunity.id = response.opportunity_id
where response.status = 'completed';

select private.issue_passport_entry(
  opportunity.created_by,
  'led_opportunity',
  'commons',
  opportunity.id,
  opportunity.title,
  opportunity.completed_at,
  null
)
from public.creator_opportunities opportunity
where opportunity.status = 'completed';

select private.issue_passport_entry(
  membership.user_id,
  case membership.role
    when 'game_master' then 'led_campaign'::public.passport_activity_kind
    else 'completed_campaign'::public.passport_activity_kind
  end,
  'realm',
  campaign.id,
  campaign.title,
  campaign.completed_at,
  null
)
from public.realm_campaigns campaign
join public.campaign_members membership
  on membership.campaign_id = campaign.id
where campaign.status = 'completed'
  and membership.status = 'active';

alter table public.passport_entries enable row level security;

create policy "passport_entries_select_own"
on public.passport_entries for select
to authenticated
using (user_id = (select auth.uid()));

revoke all on public.passport_entries from anon, authenticated;
grant usage on type
  public.passport_activity_kind,
  public.passport_source_module,
  public.passport_entry_status,
  public.passport_revocation_kind
to authenticated;
grant select on public.passport_entries to authenticated;
