create table if not exists public.circle_messages (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null
    references public.circles(id)
    on delete cascade,
  user_id uuid not null
    references auth.users(id)
    on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  constraint circle_messages_body_length
    check (
      char_length(btrim(body)) between 1 and 2000
    )
);

create index if not exists circle_messages_circle_created_idx
  on public.circle_messages(circle_id, created_at desc);

create index if not exists circle_messages_user_idx
  on public.circle_messages(user_id);

alter table public.circle_messages enable row level security;

drop policy if exists "Active Circle members can read Circle chat"
  on public.circle_messages;

create policy "Active Circle members can read Circle chat"
on public.circle_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.circle_members member
    where member.circle_id = circle_messages.circle_id
      and member.user_id = auth.uid()
      and member.status = 'active'
  )
);

drop policy if exists "Active Circle members can send Circle messages"
  on public.circle_messages;

create policy "Active Circle members can send Circle messages"
on public.circle_messages
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.circle_members member
    where member.circle_id = circle_messages.circle_id
      and member.user_id = auth.uid()
      and member.status = 'active'
  )
);

drop policy if exists "Members can update their own Circle messages"
  on public.circle_messages;

create policy "Members can update their own Circle messages"
on public.circle_messages
for update
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.circle_members member
    where member.circle_id = circle_messages.circle_id
      and member.user_id = auth.uid()
      and member.status = 'active'
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.circle_members member
    where member.circle_id = circle_messages.circle_id
      and member.user_id = auth.uid()
      and member.status = 'active'
  )
);

drop policy if exists "Members can delete their own Circle messages"
  on public.circle_messages;

create policy "Members can delete their own Circle messages"
on public.circle_messages
for delete
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.circle_members member
    where member.circle_id = circle_messages.circle_id
      and member.user_id = auth.uid()
      and member.status = 'active'
  )
);

create or replace function public.send_circle_message(
  p_circle_id uuid,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_message_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if char_length(btrim(p_body)) not between 1 and 2000 then
    raise exception 'Invalid Circle message'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.circle_members member
    where member.circle_id = p_circle_id
      and member.user_id = auth.uid()
      and member.status = 'active'
  ) then
    raise exception 'Active Circle membership required'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.circles circle
    where circle.id = p_circle_id
      and circle.status <> 'archived'
  ) then
    raise exception 'Circle chat is unavailable'
      using errcode = '22023';
  end if;

  insert into public.circle_messages (
    circle_id,
    user_id,
    body
  )
  values (
    p_circle_id,
    auth.uid(),
    btrim(p_body)
  )
  returning id into new_message_id;

  return new_message_id;
end;
$$;

revoke all on function public.send_circle_message(uuid, text) from public;
grant execute on function public.send_circle_message(uuid, text) to authenticated;

notify pgrst, 'reload schema';