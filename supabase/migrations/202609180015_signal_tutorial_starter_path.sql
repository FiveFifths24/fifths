create table public.signal_tutorial_progress (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  status text not null default 'not_started',
  current_step smallint not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  skipped_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint signal_tutorial_progress_status check (
    status in ('not_started', 'in_progress', 'skipped', 'completed')
  ),
  constraint signal_tutorial_progress_step check (current_step between 0 and 9),
  constraint signal_tutorial_progress_lifecycle check (
    (status = 'completed' and completed_at is not null)
    or (status = 'skipped' and skipped_at is not null)
    or status in ('not_started', 'in_progress')
  )
);

create table public.signal_starter_path_tasks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_key text not null,
  completion_source text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, task_key),
  constraint signal_starter_path_task_key check (
    task_key in (
      'tour_complete',
      'profile_customized',
      'pulse_complete',
      'circle_joined',
      'session_registered',
      'commons_explored',
      'realm_visited',
      'passport_opened',
      'starter_complete'
    )
  ),
  constraint signal_starter_path_completion_source check (
    completion_source in ('tutorial', 'verified_state', 'exploration', 'system')
  )
);

create index signal_starter_path_tasks_completed_idx
  on public.signal_starter_path_tasks(user_id, completed_at);

alter table public.signal_tutorial_progress enable row level security;
alter table public.signal_starter_path_tasks enable row level security;

create policy "signal_tutorial_progress_select_own"
on public.signal_tutorial_progress
for select
to authenticated
using (user_id = auth.uid());

create policy "signal_starter_path_tasks_select_own"
on public.signal_starter_path_tasks
for select
to authenticated
using (user_id = auth.uid());

revoke all on public.signal_tutorial_progress from public, anon, authenticated;
revoke all on public.signal_starter_path_tasks from public, anon, authenticated;
grant select on public.signal_tutorial_progress to authenticated;
grant select on public.signal_starter_path_tasks to authenticated;

create or replace function private.complete_signal_starter_task(
  p_user_id uuid,
  p_task_key text,
  p_source text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.signal_starter_path_tasks (
    user_id,
    task_key,
    completion_source
  ) values (
    p_user_id,
    p_task_key,
    p_source
  )
  on conflict (user_id, task_key) do nothing;
end;
$$;

revoke all on function private.complete_signal_starter_task(uuid, text, text)
  from public, anon, authenticated;

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
    pg_catalog.hashtextextended('signal-tutorial:' || current_user_id::text, 0)
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
    case when p_action = 'complete' then 9 else coalesce(p_step, 0) end,
    case when p_action in ('start', 'advance', 'complete') then now() else null end,
    case when p_action = 'complete' then now() else null end,
    case when p_action = 'skip' then now() else null end,
    now()
  )
  on conflict (user_id) do update
  set status = case
        when signal_tutorial_progress.status = 'completed' then 'completed'
        when p_action = 'complete' then 'completed'
        when p_action = 'skip' then 'skipped'
        else 'in_progress'
      end,
      current_step = case
        when signal_tutorial_progress.status = 'completed' then 9
        when p_action = 'complete' then 9
        else greatest(signal_tutorial_progress.current_step, coalesce(p_step, 0))
      end,
      started_at = case
        when p_action in ('start', 'advance', 'complete')
          then coalesce(signal_tutorial_progress.started_at, now())
        else signal_tutorial_progress.started_at
      end,
      completed_at = case
        when signal_tutorial_progress.status = 'completed'
          then signal_tutorial_progress.completed_at
        when p_action = 'complete' then now()
        else null
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

create or replace function public.record_signal_exploration(
  p_destination text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  task_key text;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  task_key := case p_destination
    when 'commons' then 'commons_explored'
    when 'realm' then 'realm_visited'
    when 'passport' then 'passport_opened'
    else null
  end;

  if task_key is null then
    raise exception 'Unsupported exploration destination' using errcode = '22023';
  end if;

  perform private.complete_signal_starter_task(
    current_user_id,
    task_key,
    'exploration'
  );
end;
$$;

create or replace function public.sync_signal_starter_path()
returns setof public.signal_starter_path_tasks
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

  if exists (
    select 1
    from public.profiles profile
    where profile.id = current_user_id
      and (
        nullif(btrim(profile.bio), '') is not null
        or profile.avatar_url is not null
        or profile.cover_image_url is not null
        or profile.background_image_url is not null
        or profile.profile_accent_color <> '#a855f7'
      )
  ) then
    perform private.complete_signal_starter_task(
      current_user_id,
      'profile_customized',
      'verified_state'
    );
  end if;

  if exists (
    select 1 from public.pulse_check_ins where user_id = current_user_id
  ) then
    perform private.complete_signal_starter_task(
      current_user_id,
      'pulse_complete',
      'verified_state'
    );
  end if;

  if exists (
    select 1
    from public.circle_members
    where user_id = current_user_id and status = 'active'
  ) then
    perform private.complete_signal_starter_task(
      current_user_id,
      'circle_joined',
      'verified_state'
    );
  end if;

  if exists (
    select 1
    from public.registrations
    where user_id = current_user_id and status = 'registered'
  ) then
    perform private.complete_signal_starter_task(
      current_user_id,
      'session_registered',
      'verified_state'
    );
  end if;

  if (
    select count(*)
    from public.signal_starter_path_tasks
    where user_id = current_user_id
      and task_key <> 'starter_complete'
  ) = 8 then
    perform private.complete_signal_starter_task(
      current_user_id,
      'starter_complete',
      'system'
    );
  end if;

  return query
  select task.*
  from public.signal_starter_path_tasks task
  where task.user_id = current_user_id
  order by task.completed_at, task.task_key;
end;
$$;

revoke all on function public.set_signal_tutorial_progress(text, integer)
  from public, anon, authenticated;
revoke all on function public.record_signal_exploration(text)
  from public, anon, authenticated;
revoke all on function public.sync_signal_starter_path()
  from public, anon, authenticated;

grant execute on function public.set_signal_tutorial_progress(text, integer)
  to authenticated;
grant execute on function public.record_signal_exploration(text)
  to authenticated;
grant execute on function public.sync_signal_starter_path()
  to authenticated;

notify pgrst, 'reload schema';
