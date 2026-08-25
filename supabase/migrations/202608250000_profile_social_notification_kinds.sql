-- Enum values must commit before later migrations use them in function bodies.
alter type public.notification_kind add value if not exists 'friend_request';
alter type public.notification_kind add value if not exists 'friend_accepted';
alter type public.notification_kind add value if not exists 'new_follower';

