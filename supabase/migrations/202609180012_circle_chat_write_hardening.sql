-- Circle chat write hardening:
-- authenticated members may read visible chat rows directly,
-- but all writes must go through vetted RPCs.

drop policy if exists "Active Circle members can send Circle messages"
  on public.circle_messages;

drop policy if exists "Members can update their own Circle messages"
  on public.circle_messages;

drop policy if exists "Members can delete their own Circle messages"
  on public.circle_messages;

-- Keep the existing SELECT policy in place.
-- Remove direct mutation privileges from authenticated clients.
revoke insert, update, delete
  on public.circle_messages
  from authenticated;

-- Preserve read access for realtime + normal member reads.
grant select
  on public.circle_messages
  to authenticated;

-- RPCs remain the only supported write paths.

revoke all
  on function public.send_circle_message(uuid, text)
  from public;

grant execute
  on function public.send_circle_message(uuid, text)
  to authenticated;

revoke all
  on function public.delete_circle_message(uuid)
  from public;

grant execute
  on function public.delete_circle_message(uuid)
  to authenticated;

revoke all
  on function public.moderate_circle_message(uuid)
  from public;

grant execute
  on function public.moderate_circle_message(uuid)
  to authenticated;

notify pgrst, 'reload schema';