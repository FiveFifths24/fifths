-- Repair SIGNAL member creation access.
--
-- This migration intentionally reapplies the capability behavior from
-- 202608160001 in case that migration was recorded in migration history
-- without its SQL being executed.
--
-- Every onboarded member can use ordinary creation capabilities.
-- Moderator and platform_admin remain explicitly assigned authority roles.

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


-- A Session creator manages their own Session without requiring
-- a separately assigned host role.

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