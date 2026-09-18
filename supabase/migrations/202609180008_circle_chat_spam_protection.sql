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
  current_user_id uuid := auth.uid();
  clean_body text := btrim(p_body);
  new_message_id uuid;
  one_minute_count integer;
  ten_minute_count integer;
  duplicate_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if char_length(clean_body) not between 1 and 2000 then
    raise exception 'Invalid Circle message'
      using errcode = '22023';
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

  if not exists (
    select 1
    from public.circles circle
    where circle.id = p_circle_id
      and circle.status <> 'archived'
  ) then
    raise exception 'Circle chat is unavailable'
      using errcode = '22023';
  end if;

  /*
   * Serialize message sends for this member so multiple rapid requests
   * cannot bypass the counters at the same time.
   */
  perform pg_advisory_xact_lock(
    hashtextextended(
      current_user_id::text || ':circle-chat',
      0
    )
  );

  select count(*)
  into one_minute_count
  from public.circle_messages
  where user_id = current_user_id
    and created_at > now() - interval '1 minute';

  if one_minute_count >= 8 then
    raise exception 'Circle chat rate limit reached'
      using errcode = '22023';
  end if;

  select count(*)
  into ten_minute_count
  from public.circle_messages
  where user_id = current_user_id
    and created_at > now() - interval '10 minutes';

  if ten_minute_count >= 40 then
    raise exception 'Circle chat cooldown required'
      using errcode = '22023';
  end if;

  select count(*)
  into duplicate_count
  from public.circle_messages
  where user_id = current_user_id
    and lower(btrim(body)) = lower(clean_body)
    and created_at > now() - interval '5 minutes';

  if duplicate_count >= 2 then
    raise exception 'Repeated Circle message blocked'
      using errcode = '22023';
  end if;

  insert into public.circle_messages (
    circle_id,
    user_id,
    body
  )
  values (
    p_circle_id,
    current_user_id,
    clean_body
  )
  returning id into new_message_id;

  return new_message_id;
end;
$$;

revoke all on function public.send_circle_message(uuid, text) from public;
grant execute on function public.send_circle_message(uuid, text) to authenticated;

notify pgrst, 'reload schema';