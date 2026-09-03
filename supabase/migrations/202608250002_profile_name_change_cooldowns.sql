-- Profile names may be changed at most once every seven days. The trigger is
-- the source of truth so the rule also applies outside the account UI.

alter table public.profiles
add column username_changed_at timestamptz,
add column display_name_changed_at timestamptz;

create or replace function public.enforce_profile_name_change_cooldowns()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.username is distinct from new.username then
    if old.username_changed_at is not null
       and old.username_changed_at > now() - interval '7 days' then
      raise exception 'USERNAME_CHANGE_COOLDOWN' using errcode = 'P0001';
    end if;
    new.username_changed_at := now();
  else
    new.username_changed_at := old.username_changed_at;
  end if;

  if old.display_name is distinct from new.display_name then
    if old.display_name_changed_at is not null
       and old.display_name_changed_at > now() - interval '7 days' then
      raise exception 'DISPLAY_NAME_CHANGE_COOLDOWN' using errcode = 'P0001';
    end if;
    new.display_name_changed_at := now();
  else
    new.display_name_changed_at := old.display_name_changed_at;
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_profile_name_change_cooldowns() from public;

create trigger profiles_enforce_name_change_cooldowns
before update on public.profiles
for each row execute function public.enforce_profile_name_change_cooldowns();

create or replace function public.update_profile_settings(
  p_username text,
  p_display_name text,
  p_bio text,
  p_visibility public.profile_visibility,
  p_discoverable boolean,
  p_avatar_url text,
  p_cover_image_url text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_username text := lower(btrim(p_username));
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if normalized_username !~ '^[a-z0-9](?:[a-z0-9_]*[a-z0-9])?$'
     or char_length(normalized_username) not between 3 and 30 then
    raise exception 'Invalid username' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.profiles
    where id <> current_user_id and username = normalized_username
  ) then
    raise exception 'USERNAME_TAKEN' using errcode = '23505';
  end if;
  if char_length(btrim(p_display_name)) not between 1 and 80 then
    raise exception 'Invalid display name' using errcode = '22023';
  end if;
  if p_bio is not null and char_length(btrim(p_bio)) > 500 then
    raise exception 'Bio is too long' using errcode = '22023';
  end if;

  update public.profiles
  set username = normalized_username,
      display_name = btrim(p_display_name),
      bio = nullif(btrim(p_bio), ''),
      visibility = p_visibility,
      discoverable = p_discoverable,
      avatar_url = nullif(p_avatar_url, ''),
      cover_image_url = nullif(p_cover_image_url, '')
  where id = current_user_id;
end;
$$;

revoke all on function public.update_profile_settings(
  text, text, text, public.profile_visibility, boolean, text, text
) from public;
grant execute on function public.update_profile_settings(
  text, text, text, public.profile_visibility, boolean, text, text
) to authenticated;
