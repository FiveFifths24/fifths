-- Limit near-term Session publishing without restricting draft creation.
-- The transaction-scoped host lock makes the count-and-publish operation safe
-- when multiple drafts are published concurrently.

create or replace function public.set_session_status(
  p_session_id uuid,
  p_status public.session_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_session public.sessions%rowtype;
  published_upcoming_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into current_session
  from public.sessions
  where id = p_session_id
  for update;

  if not found or not public.can_manage_session(p_session_id) then
    raise exception 'Session management denied' using errcode = '42501';
  end if;

  if p_status = 'published'
     and current_session.status = 'draft'
     and current_session.starts_at > now() then
    if current_session.starts_at <= now() + interval '14 days' then
      perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(
          'session-publish-cap:' || current_session.host_user_id::text,
          0
        )
      );

      select count(*) into published_upcoming_count
      from public.sessions
      where host_user_id = current_session.host_user_id
        and status = 'published'
        and starts_at > now()
        and starts_at <= now() + interval '14 days';

      if published_upcoming_count >= 5 then
        raise exception 'You already have 5 published Sessions scheduled within the next 14 days. Cancel or complete one before publishing another.'
          using errcode = 'P0001';
      end if;
    end if;

    update public.sessions
    set status = 'published', published_at = now()
    where id = p_session_id;
  elsif p_status = 'cancelled'
        and current_session.status in ('draft', 'published') then
    update public.sessions
    set status = 'cancelled'
    where id = p_session_id;
  elsif p_status = 'completed'
        and current_session.status = 'published'
        and current_session.ends_at <= now() then
    update public.sessions
    set status = 'completed'
    where id = p_session_id;
  else
    raise exception 'Invalid session status transition' using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.set_session_status(uuid, public.session_status)
from public, anon;
grant execute on function public.set_session_status(uuid, public.session_status)
to authenticated;
