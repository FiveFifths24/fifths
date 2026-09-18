create type public.account_data_request_type as enum (
  'deactivation',
  'deletion'
);

create type public.account_data_request_status as enum (
  'submitted',
  'in_review',
  'cancelled',
  'completed',
  'declined'
);

create table public.account_data_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  request_type public.account_data_request_type not null,
  status public.account_data_request_status not null default 'submitted',
  member_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  completed_at timestamptz,
  constraint account_data_request_note_length
    check (member_note is null or char_length(member_note) <= 500)
);

create unique index account_data_requests_one_active_idx
  on public.account_data_requests(user_id)
  where status in ('submitted', 'in_review');

create index account_data_requests_review_idx
  on public.account_data_requests(status, created_at);

alter table public.account_data_requests enable row level security;

create policy "account_data_requests_select_own_or_admin"
on public.account_data_requests
for select
to authenticated
using (
  user_id = auth.uid()
  or public.has_role('platform_admin')
);

revoke all on public.account_data_requests from public, anon, authenticated;
grant select on public.account_data_requests to authenticated;

create table private.account_data_request_audit_logs (
  id bigint generated always as identity primary key,
  request_id uuid not null,
  actor_user_id uuid,
  previous_status public.account_data_request_status,
  next_status public.account_data_request_status not null,
  created_at timestamptz not null default now()
);

revoke all on private.account_data_request_audit_logs
  from public, anon, authenticated;

create or replace function private.audit_account_data_request_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.account_data_request_audit_logs (
    request_id,
    actor_user_id,
    previous_status,
    next_status
  ) values (
    new.id,
    auth.uid(),
    case when tg_op = 'UPDATE' then old.status else null end,
    new.status
  );
  return new;
end;
$$;

create trigger account_data_request_audit_change
after insert or update of status on public.account_data_requests
for each row execute function private.audit_account_data_request_change();

revoke all on function private.audit_account_data_request_change() from public;

create or replace function public.request_account_data_action(
  p_request_type public.account_data_request_type,
  p_member_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  request_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_member_note is not null and char_length(p_member_note) > 500 then
    raise exception 'Account request note is too long' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'account-data-request:' || current_user_id::text,
      0
    )
  );

  select id into request_id
  from public.account_data_requests
  where user_id = current_user_id
    and status in ('submitted', 'in_review')
  order by created_at desc
  limit 1;

  if request_id is not null then
    return request_id;
  end if;

  insert into public.account_data_requests (
    user_id,
    request_type,
    member_note
  ) values (
    current_user_id,
    p_request_type,
    nullif(btrim(p_member_note), '')
  )
  returning id into request_id;

  return request_id;
end;
$$;

create or replace function public.cancel_account_data_request(
  p_request_id uuid
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

  update public.account_data_requests
  set status = 'cancelled'
  where id = p_request_id
    and user_id = auth.uid()
    and status = 'submitted';

  if not found then
    raise exception 'Submitted account request not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.request_account_data_action(
  public.account_data_request_type,
  text
) from public;
revoke all on function public.cancel_account_data_request(uuid) from public;

grant execute on function public.request_account_data_action(
  public.account_data_request_type,
  text
) to authenticated;
grant execute on function public.cancel_account_data_request(uuid)
  to authenticated;

notify pgrst, 'reload schema';
