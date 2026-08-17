-- SIGNAL member creation access
--
-- All authenticated members who have completed onboarding can create
-- Sessions, Circles, Creator Commons opportunities, and Fifth Realm campaigns.
--
-- Legacy host / creator / game_master checks remain compatible with the
-- existing application, but these are now treated as member capabilities
-- rather than manually assigned account statuses.
--
-- Moderator and platform_admin remain explicitly assigned staff roles.

create or replace function public.has_role(
  requested_role public.app_role
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    case
      when requested_role in (
        'host'::public.app_role,
        'creator'::public.app_role,
        'game_master'::public.app_role
      )
      then exists (
        select 1
        from public.profiles
        join public.user_roles
          on user_roles.user_id = profiles.id
        where profiles.id = auth.uid()
          and profiles.onboarding_completed_at is not null
          and user_roles.role = 'member'::public.app_role
      )

      else exists (
        select 1
        from public.user_roles
        where user_id = auth.uid()
          and role = requested_role
      )
    end;
$$;

revoke all
on function public.has_role(public.app_role)
from public;

grant execute
on function public.has_role(public.app_role)
to authenticated;


-- Session ownership now determines Session management.
--
-- Previously the creator had to ALSO retain a separately assigned host role,
-- even if they were already the Session's host_user_id.
--
-- An authenticated member who created a Session can manage that Session.
-- Platform admins retain global management authority.

create or replace function public.can_manage_session(
  p_session_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.sessions
    where sessions.id = p_session_id
      and sessions.host_user_id = auth.uid()
  )
  or public.has_role(
    'platform_admin'::public.app_role
  );
$$;

revoke all
on function public.can_manage_session(uuid)
from public;

grant execute
on function public.can_manage_session(uuid)
to authenticated;