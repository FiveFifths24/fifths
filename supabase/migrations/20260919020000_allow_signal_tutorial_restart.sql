create or replace function public.set_signal_tutorial_progress(
  p_action text,
  p_step integer default null
)
returns public.signal_tutorial_progress
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  result public.signal_tutorial_progress;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_action not in ('start', 'advance', 'skip', 'complete') then
    raise exception 'Unsupported tutorial action' using errcode = '22023';
  end if;

  if p_step is not null and (p_step < 0 or p_step > 9) then
    raise exception 'Tutorial step is out of range' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'signal-tutorial:' || current_user_id::text,
      0
    )
  );

  insert into public.signal_tutorial_progress (
    user_id,
    status,
    current_step,
    started_at,
    completed_at,
    skipped_at,
    updated_at
  ) values (
    current_user_id,
    case
      when p_action = 'complete' then 'completed'
      when p_action = 'skip' then 'skipped'
      else 'in_progress'
    end,
    case
      when p_action = 'complete' then 9
      else coalesce(p_step, 0)
    end,
    case
      when p_action in ('start', 'advance', 'complete') then now()
      else null
    end,
    case
      when p_action = 'complete' then now()
      else null
    end,
    case
      when p_action = 'skip' then now()
      else null
    end,
    now()
  )
  on conflict (user_id) do update
  set
    status = case
      when p_action = 'complete' then 'completed'
      when p_action = 'skip' then 'skipped'
      else 'in_progress'
    end,

    current_step = case
      when p_action = 'start' then coalesce(p_step, 0)
      when p_action = 'complete' then 9
      when p_action = 'advance'
        then greatest(
          signal_tutorial_progress.current_step,
          coalesce(p_step, 0)
        )
      else signal_tutorial_progress.current_step
    end,

    started_at = case
      when p_action = 'start' then now()
      when p_action in ('advance', 'complete')
        then coalesce(signal_tutorial_progress.started_at, now())
      else signal_tutorial_progress.started_at
    end,

    completed_at = case
      when p_action = 'complete' then now()
      when p_action in ('start', 'advance') then null
      else signal_tutorial_progress.completed_at
    end,

    skipped_at = case
      when p_action = 'skip' then now()
      when p_action in ('start', 'advance', 'complete') then null
      else signal_tutorial_progress.skipped_at
    end,

    updated_at = now()

  returning * into result;

  if result.status = 'completed' then
    perform private.complete_signal_starter_task(
      current_user_id,
      'tour_complete',
      'tutorial'
    );
  end if;

  return result;
end;
$$;

revoke all on function public.set_signal_tutorial_progress(text, integer)
  from public, anon, authenticated;

grant execute on function public.set_signal_tutorial_progress(text, integer)
  to authenticated;

notify pgrst, 'reload schema';