-- One-to-one direct messages for SIGNAL.
-- Conversations are unique per pair of users.
-- Blocked profiles cannot create conversations or send/read new messages together.

create table public.direct_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id_a uuid not null references public.profiles (id) on delete cascade,
  user_id_b uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint direct_conversations_not_self
    check (user_id_a <> user_id_b),

  constraint direct_conversations_ordered
    check (user_id_a::text < user_id_b::text),

  unique (user_id_a, user_id_b)
);

create table public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null
    references public.direct_conversations (id)
    on delete cascade,
  sender_id uuid not null
    references public.profiles (id)
    on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,

  constraint direct_messages_body_length
    check (char_length(btrim(body)) between 1 and 2000)
);

create index direct_conversations_user_a_idx
on public.direct_conversations (user_id_a, updated_at desc);

create index direct_conversations_user_b_idx
on public.direct_conversations (user_id_b, updated_at desc);

create index direct_messages_conversation_idx
on public.direct_messages (conversation_id, created_at asc);

create index direct_messages_sender_idx
on public.direct_messages (sender_id, created_at desc);


create or replace function public.is_direct_conversation_member(
  p_conversation_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.direct_conversations conversation
    where conversation.id = p_conversation_id
      and (
        conversation.user_id_a = p_user_id
        or conversation.user_id_b = p_user_id
      )
  );
$$;


create or replace function public.direct_conversation_other_user(
  p_conversation_id uuid,
  p_user_id uuid
)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select
    case
      when conversation.user_id_a = p_user_id
        then conversation.user_id_b
      when conversation.user_id_b = p_user_id
        then conversation.user_id_a
      else null
    end
  from public.direct_conversations conversation
  where conversation.id = p_conversation_id
  limit 1;
$$;


create or replace function public.get_or_create_direct_conversation(
  p_target_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  first_user_id uuid;
  second_user_id uuid;
  conversation_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if p_target_user_id is null then
    raise exception 'Target user is required'
      using errcode = '22023';
  end if;

  if current_user_id = p_target_user_id then
    raise exception 'You cannot message yourself'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = p_target_user_id
  ) then
    raise exception 'Profile not found'
      using errcode = '22023';
  end if;

  if public.profiles_are_blocked(
    current_user_id,
    p_target_user_id
  ) then
    raise exception 'Messaging is unavailable between these profiles'
      using errcode = '42501';
  end if;

  first_user_id :=
    least(
      current_user_id::text,
      p_target_user_id::text
    )::uuid;

  second_user_id :=
    greatest(
      current_user_id::text,
      p_target_user_id::text
    )::uuid;

  insert into public.direct_conversations (
    user_id_a,
    user_id_b
  )
  values (
    first_user_id,
    second_user_id
  )
  on conflict (user_id_a, user_id_b)
  do update
  set updated_at = public.direct_conversations.updated_at
  returning id into conversation_id;

  return conversation_id;
end;
$$;


create or replace function public.send_direct_message(
  p_conversation_id uuid,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  other_user_id uuid;
  message_id uuid;
  cleaned_body text;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  cleaned_body := btrim(p_body);

  if char_length(cleaned_body) not between 1 and 2000 then
    raise exception 'Message must be between 1 and 2000 characters'
      using errcode = '22023';
  end if;

  if not public.is_direct_conversation_member(
    p_conversation_id,
    current_user_id
  ) then
    raise exception 'Conversation not found'
      using errcode = '42501';
  end if;

  other_user_id :=
    public.direct_conversation_other_user(
      p_conversation_id,
      current_user_id
    );

  if other_user_id is null then
    raise exception 'Conversation not found'
      using errcode = '42501';
  end if;

  if public.profiles_are_blocked(
    current_user_id,
    other_user_id
  ) then
    raise exception 'Messaging is unavailable between these profiles'
      using errcode = '42501';
  end if;

  insert into public.direct_messages (
    conversation_id,
    sender_id,
    body
  )
  values (
    p_conversation_id,
    current_user_id,
    cleaned_body
  )
  returning id into message_id;

  update public.direct_conversations
  set updated_at = now()
  where id = p_conversation_id;

  return message_id;
end;
$$;


alter table public.direct_conversations enable row level security;
alter table public.direct_messages enable row level security;


create policy "direct_conversations_select_members"
on public.direct_conversations
for select
to authenticated
using (
  (
    user_id_a = (select auth.uid())
    or user_id_b = (select auth.uid())
  )
  and not public.profiles_are_blocked(
    user_id_a,
    user_id_b
  )
);


create policy "direct_messages_select_members"
on public.direct_messages
for select
to authenticated
using (
  public.is_direct_conversation_member(
    conversation_id,
    (select auth.uid())
  )
  and not public.profiles_are_blocked(
    (select auth.uid()),
    public.direct_conversation_other_user(
      conversation_id,
      (select auth.uid())
    )
  )
);


revoke all on public.direct_conversations
from anon, authenticated;

revoke all on public.direct_messages
from anon, authenticated;

grant select on public.direct_conversations
to authenticated;

grant select on public.direct_messages
to authenticated;


revoke all on function
public.is_direct_conversation_member(uuid, uuid)
from public;

revoke all on function
public.direct_conversation_other_user(uuid, uuid)
from public;

revoke all on function
public.get_or_create_direct_conversation(uuid)
from public;

revoke all on function
public.send_direct_message(uuid, text)
from public;


grant execute on function
public.is_direct_conversation_member(uuid, uuid)
to authenticated;

grant execute on function
public.direct_conversation_other_user(uuid, uuid)
to authenticated;

grant execute on function
public.get_or_create_direct_conversation(uuid)
to authenticated;

grant execute on function
public.send_direct_message(uuid, text)
to authenticated;