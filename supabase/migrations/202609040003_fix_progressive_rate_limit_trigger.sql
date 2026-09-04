-- Repair the shared progressive rate-limit trigger so it can safely
-- operate across tables with different row shapes.

create or replace function private.enforce_signal_action_rate_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
  row_data jsonb;
  member_role text;
  message_body text;
begin
  row_data := to_jsonb(new);
  actor_id := auth.uid();

  if actor_id is null then
    actor_id := coalesce(
      nullif(row_data ->> 'sender_id', '')::uuid,
      nullif(row_data ->> 'follower_id', '')::uuid,
      nullif(row_data ->> 'requested_by', '')::uuid,
      nullif(row_data ->> 'user_id', '')::uuid,
      nullif(row_data ->> 'host_user_id', '')::uuid,
      nullif(row_data ->> 'created_by', '')::uuid
    );
  end if;

  if tg_table_name = 'direct_messages' then
    message_body := coalesce(row_data ->> 'body', '');

    perform private.claim_action_rate_limit(
      actor_id,
      'direct_message',
      30,
      interval '10 minutes'
    );

    perform private.claim_action_rate_limit(
      actor_id,
      'direct_message_repeat:' || md5(lower(btrim(message_body))),
      5,
      interval '1 hour'
    );

  elsif tg_table_name = 'profile_follows' then
    perform private.claim_action_rate_limit(
      actor_id,
      'follow',
      60,
      interval '1 hour'
    );

  elsif tg_table_name = 'profile_friendships' then
    perform private.claim_action_rate_limit(
      actor_id,
      'friend_request',
      30,
      interval '1 day'
    );

  elsif tg_table_name = 'registrations' then
    perform private.claim_action_rate_limit(
      actor_id,
      'session_registration',
      30,
      interval '1 hour'
    );

  elsif tg_table_name = 'circle_members' then
    member_role := row_data ->> 'role';

    if member_role is distinct from 'owner' then
      perform private.claim_action_rate_limit(
        actor_id,
        'circle_membership',
        30,
        interval '1 hour'
      );
    end if;

  elsif tg_table_name = 'sessions' then
    perform private.claim_action_rate_limit(
      actor_id,
      'session_create',
      10,
      interval '1 day'
    );

  elsif tg_table_name = 'circles' then
    perform private.claim_action_rate_limit(
      actor_id,
      'circle_create',
      5,
      interval '1 day'
    );

  elsif tg_table_name = 'creator_opportunities' then
    perform private.claim_action_rate_limit(
      actor_id,
      'commons_create',
      10,
      interval '1 day'
    );
  end if;

  return new;
end;
$$;

revoke all
on function private.enforce_signal_action_rate_limits()
from public, anon, authenticated;