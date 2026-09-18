-- Retain deleted Circle chat evidence without leaving the original body in a
-- table that active members may SELECT for realtime delivery.

create table if not exists private.circle_message_deleted_bodies (
  message_id uuid primary key
    references public.circle_messages(id)
    on delete cascade,
  circle_id uuid not null,
  author_user_id uuid not null,
  body text not null,
  deleted_at timestamptz not null,
  deleted_by uuid,
  deletion_type text not null,
  retained_at timestamptz not null default now()
);

alter table private.circle_message_deleted_bodies enable row level security;
revoke all on private.circle_message_deleted_bodies
  from public, anon, authenticated;

insert into private.circle_message_deleted_bodies (
  message_id,
  circle_id,
  author_user_id,
  body,
  deleted_at,
  deleted_by,
  deletion_type
)
select
  id,
  circle_id,
  user_id,
  body,
  deleted_at,
  deleted_by,
  coalesce(deletion_type, 'self')
from public.circle_messages
where deleted_at is not null
on conflict (message_id) do nothing;

update public.circle_messages
set body = '[deleted]'
where deleted_at is not null;

create or replace function public.delete_circle_message(
  p_message_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_message public.circle_messages%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  select *
  into target_message
  from public.circle_messages
  where id = p_message_id
  for update;

  if not found then
    raise exception 'Circle message not found'
      using errcode = 'P0002';
  end if;

  if target_message.user_id <> current_user_id then
    raise exception 'You can only delete your own Circle messages'
      using errcode = '42501';
  end if;

  if target_message.deleted_at is not null then
    return;
  end if;

  insert into private.circle_message_deleted_bodies (
    message_id,
    circle_id,
    author_user_id,
    body,
    deleted_at,
    deleted_by,
    deletion_type
  ) values (
    target_message.id,
    target_message.circle_id,
    target_message.user_id,
    target_message.body,
    now(),
    current_user_id,
    'self'
  );

  update public.circle_messages
  set
    body = '[deleted]',
    deleted_at = now(),
    deleted_by = current_user_id,
    deletion_type = 'self'
  where id = p_message_id;
end;
$$;

create or replace function public.moderate_circle_message(
  p_message_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  target_message public.circle_messages%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  select *
  into target_message
  from public.circle_messages
  where id = p_message_id
  for update;

  if not found then
    raise exception 'Circle message not found'
      using errcode = 'P0002';
  end if;

  if not (
    exists (
      select 1
      from public.circle_members member
      where member.circle_id = target_message.circle_id
        and member.user_id = current_user_id
        and member.status = 'active'
        and member.role = 'owner'
    )
    or public.has_role('platform_admin')
  ) then
    raise exception 'Circle owner or platform administrator required'
      using errcode = '42501';
  end if;

  if target_message.deleted_at is not null then
    return;
  end if;

  insert into private.circle_message_deleted_bodies (
    message_id,
    circle_id,
    author_user_id,
    body,
    deleted_at,
    deleted_by,
    deletion_type
  ) values (
    target_message.id,
    target_message.circle_id,
    target_message.user_id,
    target_message.body,
    now(),
    current_user_id,
    'moderation'
  );

  update public.circle_messages
  set
    body = '[deleted]',
    deleted_at = now(),
    deleted_by = current_user_id,
    deletion_type = 'moderation'
  where id = p_message_id;
end;
$$;

create or replace function public.get_circle_chat_messages(
  p_circle_id uuid,
  p_limit integer default 100
)
returns table (
  id uuid,
  circle_id uuid,
  user_id uuid,
  body text,
  created_at timestamptz,
  edited_at timestamptz,
  deleted_at timestamptz,
  deletion_type text,
  can_view_deleted_body boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  privileged_viewer boolean;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.circle_members member
    where member.circle_id = p_circle_id
      and member.user_id = current_user_id
      and member.status = 'active'
  ) then
    raise exception 'Active Circle membership required'
      using errcode = '42501';
  end if;

  privileged_viewer :=
    exists (
      select 1
      from public.circle_members member
      where member.circle_id = p_circle_id
        and member.user_id = current_user_id
        and member.status = 'active'
        and member.role = 'owner'
    )
    or public.has_role('platform_admin');

  return query
  select
    message.id,
    message.circle_id,
    message.user_id,
    case
      when message.deleted_at is null then message.body
      when privileged_viewer then retained.body
      else null
    end,
    message.created_at,
    message.edited_at,
    message.deleted_at,
    message.deletion_type,
    privileged_viewer
  from public.circle_messages message
  left join private.circle_message_deleted_bodies retained
    on retained.message_id = message.id
  where message.circle_id = p_circle_id
  order by message.created_at desc
  limit greatest(1, least(coalesce(p_limit, 100), 200));
end;
$$;

revoke all on function public.delete_circle_message(uuid) from public;
revoke all on function public.moderate_circle_message(uuid) from public;
revoke all on function public.get_circle_chat_messages(uuid, integer) from public;

grant execute on function public.delete_circle_message(uuid) to authenticated;
grant execute on function public.moderate_circle_message(uuid) to authenticated;
grant execute on function public.get_circle_chat_messages(uuid, integer)
  to authenticated;

notify pgrst, 'reload schema';
