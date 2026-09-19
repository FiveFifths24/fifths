create or replace function public.reset_signal_tutorial()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  delete from public.signal_tutorial_progress
  where user_id = current_user_id;

  delete from public.signal_starter_path_tasks
  where user_id = current_user_id
    and completion_source in ('tutorial', 'exploration', 'system');
end;
$$;

revoke all on function public.reset_signal_tutorial()
  from public, anon, authenticated;

grant execute on function public.reset_signal_tutorial()
  to authenticated;

notify pgrst, 'reload schema';