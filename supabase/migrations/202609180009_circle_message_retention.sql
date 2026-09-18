alter table public.circle_messages
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references auth.users(id),
  add column if not exists deletion_type text;

alter table public.circle_messages
  drop constraint if exists circle_messages_deletion_type_check;

alter table public.circle_messages
  add constraint circle_messages_deletion_type_check
  check (
    deletion_type is null
    or deletion_type in ('self', 'moderation')
  );

create index if not exists circle_messages_deleted_idx
  on public.circle_messages(circle_id, deleted_at)
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
  where id = p_message_id;

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

  update public.circle_messages
  set
    deleted_at = now(),
    deleted_by = current_user_id,
    deletion_type = 'self'
  where id = p_message_id;
end;
$$;

revoke all on function public.delete_circle_message(uuid) from public;
grant execute on function public.delete_circle_message(uuid) to authenticated;


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
  where id = p_message_id;

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

  update public.circle_messages
  set
    deleted_at = now(),
    deleted_by = current_user_id,
    deletion_type = 'moderation'
  where id = p_message_id;
end;
$$;

revoke all on function public.moderate_circle_message(uuid) from public;
grant execute on function public.moderate_circle_message(uuid) to authenticated;


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
      when privileged_viewer then message.body
      else null
    end,
    message.created_at,
    message.edited_at,
    message.deleted_at,
    message.deletion_type,
    privileged_viewer
  from public.circle_messages message
  where message.circle_id = p_circle_id
  order by message.created_at desc
  limit greatest(1, least(coalesce(p_limit, 100), 200));
end;
$$;

revoke all on function public.get_circle_chat_messages(uuid, integer) from public;
grant execute on function public.get_circle_chat_messages(uuid, integer)
  to authenticated;

notify pgrst, 'reload schema';