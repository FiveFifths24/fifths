-- Server-side image quarantine, moderation audit, reviewer access, and upload throttling.

create type public.media_upload_surface as enum (
  'profile_avatar',
  'profile_featured',
  'profile_featured_2',
  'profile_wallpaper',
  'profile_landscape'
);

create type public.media_moderation_status as enum (
  'pending',
  'approved',
  'review',
  'rejected',
  'error',
  'expired'
);

create table public.media_moderation_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  upload_surface public.media_upload_surface not null,
  status public.media_moderation_status not null default 'pending',
  quarantine_bucket text not null default 'media-quarantine',
  quarantine_path text not null unique,
  published_bucket text,
  published_path text unique,
  original_mime_type text not null,
  normalized_mime_type text not null default 'image/webp',
  original_byte_size integer not null,
  normalized_byte_size integer not null,
  image_width integer not null,
  image_height integer not null,
  file_sha256 text not null,
  provider text,
  provider_request_id text,
  categories jsonb not null default '{}'::jsonb,
  provider_metadata jsonb not null default '{}'::jsonb,
  decision_reason text,
  legal_escalation_required boolean not null default false,
  enforcement_metadata jsonb not null default '{}'::jsonb,
  moderated_at timestamptz,
  reviewed_at timestamptz,
  reviewer_id uuid references auth.users (id) on delete set null,
  quarantine_deleted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_moderation_quarantine_bucket check (
    quarantine_bucket = 'media-quarantine'
  ),
  constraint media_moderation_published_fields check (
    (published_bucket is null and published_path is null)
    or (published_bucket = 'profile-media' and published_path is not null)
  ),
  constraint media_moderation_sizes check (
    original_byte_size between 1 and 5242880
    and normalized_byte_size between 1 and 5242880
  ),
  constraint media_moderation_dimensions check (
    image_width between 50 and 12000
    and image_height between 50 and 12000
    and image_width::bigint * image_height::bigint <= 40000000
  ),
  constraint media_moderation_sha256 check (
    file_sha256 ~ '^[0-9a-f]{64}$'
  ),
  constraint media_moderation_categories_object check (
    jsonb_typeof(categories) = 'object'
    and jsonb_typeof(provider_metadata) = 'object'
    and jsonb_typeof(enforcement_metadata) = 'object'
  ),
  constraint media_moderation_review_lifecycle check (
    (reviewer_id is null and reviewed_at is null)
    or (reviewer_id is not null and reviewed_at is not null)
  )
);

create trigger media_moderation_records_set_updated_at
before update on public.media_moderation_records
for each row execute function public.set_updated_at();

create index media_moderation_user_created_idx
on public.media_moderation_records (user_id, created_at desc);

create index media_moderation_review_queue_idx
on public.media_moderation_records (status, created_at asc)
where status = 'review' and legal_escalation_required = false;

create index media_moderation_quarantine_cleanup_idx
on public.media_moderation_records (expires_at asc)
where quarantine_deleted_at is null and status in ('pending', 'review', 'error');

alter table public.media_moderation_records enable row level security;

create policy "media_moderation_select_reviewers"
on public.media_moderation_records for select
to authenticated
using (
  legal_escalation_required = false
  and (
    public.has_role('moderator')
    or public.has_role('platform_admin')
  )
);

revoke all on public.media_moderation_records from anon, authenticated;
grant select on public.media_moderation_records to authenticated;

create table private.media_moderation_audit_logs (
  id bigint generated always as identity primary key,
  moderation_record_id uuid not null,
  previous_status public.media_moderation_status,
  new_status public.media_moderation_status not null,
  actor_user_id uuid,
  legal_escalation_required boolean not null,
  occurred_at timestamptz not null default now()
);

revoke all on private.media_moderation_audit_logs from public, anon, authenticated;

create table private.media_upload_rate_limits (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  window_started_at timestamptz not null default now(),
  attempt_count integer not null default 0,
  constraint media_upload_attempt_count check (attempt_count between 0 and 12)
);

revoke all on private.media_upload_rate_limits from public, anon, authenticated;

create or replace function private.audit_media_moderation_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.media_moderation_audit_logs (
    moderation_record_id,
    previous_status,
    new_status,
    actor_user_id,
    legal_escalation_required
  ) values (
    new.id,
    case when tg_op = 'UPDATE' then old.status else null end,
    new.status,
    auth.uid(),
    new.legal_escalation_required
  );
  return new;
end;
$$;

create trigger media_moderation_audit_change
after insert or update of status on public.media_moderation_records
for each row execute function private.audit_media_moderation_change();

revoke all on function private.audit_media_moderation_change() from public;

create or replace function public.claim_media_upload_slots(p_count integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  next_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_count not between 1 and 5 then
    raise exception 'Invalid image upload count' using errcode = '22023';
  end if;

  insert into private.media_upload_rate_limits (
    user_id,
    window_started_at,
    attempt_count
  ) values (
    current_user_id,
    now(),
    p_count
  )
  on conflict (user_id) do update
  set window_started_at = case
        when private.media_upload_rate_limits.window_started_at <= now() - interval '1 hour'
          then now()
        else private.media_upload_rate_limits.window_started_at
      end,
      attempt_count = case
        when private.media_upload_rate_limits.window_started_at <= now() - interval '1 hour'
          then excluded.attempt_count
        else private.media_upload_rate_limits.attempt_count + excluded.attempt_count
      end
  returning attempt_count into next_count;

  if next_count > 12 then
    raise exception 'Image upload rate limit reached' using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.claim_media_upload_slots(integer) from public;
grant execute on function public.claim_media_upload_slots(integer) to authenticated;

create or replace function public.begin_media_moderation_upload(
  p_upload_surface public.media_upload_surface,
  p_quarantine_path text,
  p_original_mime_type text,
  p_normalized_byte_size integer,
  p_original_byte_size integer,
  p_image_width integer,
  p_image_height integer,
  p_file_sha256 text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  moderation_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if split_part(p_quarantine_path, '/', 1) <> current_user_id::text
     or p_quarantine_path !~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.webp$' then
    raise exception 'Invalid quarantine ownership path' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text, 0));
  if (
    select count(*)
    from public.media_moderation_records
    where user_id = current_user_id
      and created_at > now() - interval '1 hour'
  ) >= 12 then
    raise exception 'Image upload rate limit reached' using errcode = '22023';
  end if;

  insert into public.media_moderation_records (
    user_id,
    upload_surface,
    quarantine_path,
    original_mime_type,
    normalized_byte_size,
    original_byte_size,
    image_width,
    image_height,
    file_sha256
  ) values (
    current_user_id,
    p_upload_surface,
    p_quarantine_path,
    p_original_mime_type,
    p_normalized_byte_size,
    p_original_byte_size,
    p_image_width,
    p_image_height,
    p_file_sha256
  ) returning id into moderation_id;

  return moderation_id;
end;
$$;

revoke all on function public.begin_media_moderation_upload(
  public.media_upload_surface,
  text,
  text,
  integer,
  integer,
  integer,
  integer,
  text
) from public;
grant execute on function public.begin_media_moderation_upload(
  public.media_upload_surface,
  text,
  text,
  integer,
  integer,
  integer,
  integer,
  text
) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media-quarantine',
  'media-quarantine',
  false,
  5242880,
  array['image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Intentionally no authenticated or anonymous storage.objects policies exist
-- for media-quarantine. Only the server-side service role may read or mutate it.

-- Approved media is now mutated only by the server-side service role. Without
-- these drops, a member could bypass the application and upload directly.
drop policy if exists "profile_media_insert_own" on storage.objects;
drop policy if exists "profile_media_update_own" on storage.objects;
drop policy if exists "profile_media_delete_own" on storage.objects;

create or replace function private.profile_media_path_is_approved(
  p_user_id uuid,
  p_path text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_path is null or exists (
    select 1
    from public.media_moderation_records
    where user_id = p_user_id
      and status = 'approved'
      and published_bucket = 'profile-media'
      and published_path = p_path
  );
$$;

revoke all on function private.profile_media_path_is_approved(uuid, text)
from public, anon, authenticated;

create or replace function private.enforce_approved_profile_media()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.avatar_url is distinct from old.avatar_url
     and not private.profile_media_path_is_approved(new.id, new.avatar_url) then
    raise exception 'Profile avatar has not passed moderation' using errcode = '42501';
  end if;
  if new.cover_image_url is distinct from old.cover_image_url
     and not private.profile_media_path_is_approved(new.id, new.cover_image_url) then
    raise exception 'Profile landscape has not passed moderation' using errcode = '42501';
  end if;
  if new.background_image_url is distinct from old.background_image_url
     and not private.profile_media_path_is_approved(new.id, new.background_image_url) then
    raise exception 'Profile wallpaper has not passed moderation' using errcode = '42501';
  end if;
  if new.featured_profile_image_url is distinct from old.featured_profile_image_url
     and not private.profile_media_path_is_approved(new.id, new.featured_profile_image_url) then
    raise exception 'Featured image has not passed moderation' using errcode = '42501';
  end if;
  if new.featured_profile_image_2_url is distinct from old.featured_profile_image_2_url
     and not private.profile_media_path_is_approved(new.id, new.featured_profile_image_2_url) then
    raise exception 'Second featured image has not passed moderation' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_approved_profile_media()
from public, anon, authenticated;

create trigger profiles_require_approved_media
before update of avatar_url, cover_image_url, background_image_url,
  featured_profile_image_url, featured_profile_image_2_url
on public.profiles
for each row execute function private.enforce_approved_profile_media();
