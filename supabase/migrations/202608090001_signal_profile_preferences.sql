-- SIGNAL profile customization, connection preferences, and accessibility preferences.

create type public.location_visibility as enum (
  'hidden',
  'city_region',
  'region_only'
);

create type public.friend_list_visibility as enum (
  'private',
  'friends',
  'members'
);

alter table public.profiles
  add column bio text,
  add column city text,
  add column region text,
  add column country_code text,
  add column cover_image_url text,
  add column profile_song_url text,
  add column profile_song_title text,
  add column profile_song_artist text,
  add column location_visibility public.location_visibility
    not null default 'hidden',
  add column friend_list_visibility public.friend_list_visibility
    not null default 'friends',
  add column discoverable boolean not null default true;

alter table public.profiles
  add constraint profiles_bio_length
    check (bio is null or char_length(bio) <= 500),
  add constraint profiles_city_length
    check (city is null or char_length(city) <= 100),
  add constraint profiles_region_length
    check (region is null or char_length(region) <= 100),
  add constraint profiles_country_code_format
    check (
      country_code is null
      or country_code ~ '^[A-Z]{2}$'
    ),
  add constraint profiles_cover_image_url_length
    check (
      cover_image_url is null
      or char_length(cover_image_url) <= 2048
    ),
  add constraint profiles_song_url_length
    check (
      profile_song_url is null
      or char_length(profile_song_url) <= 2048
    ),
  add constraint profiles_song_title_length
    check (
      profile_song_title is null
      or char_length(profile_song_title) <= 150
    ),
  add constraint profiles_song_artist_length
    check (
      profile_song_artist is null
      or char_length(profile_song_artist) <= 150
    );

create table public.profile_connection_preferences (
  user_id uuid primary key
    references public.profiles (id)
    on delete cascade,

  open_to_friends boolean not null default true,
  open_to_activity_partners boolean not null default true,
  open_to_creative_collaboration boolean not null default false,
  open_to_professional_networking boolean not null default false,
  open_to_mentorship boolean not null default false,
  open_to_volunteering boolean not null default false,
  open_to_gaming boolean not null default false,
  open_to_travel_groups boolean not null default false,

  prefer_local boolean not null default true,
  prefer_virtual boolean not null default true,

  allow_friend_requests boolean not null default true,
  allow_circle_invites boolean not null default true,
  allow_event_invites boolean not null default true,
  show_in_mutual_connections boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile_accessibility_preferences (
  user_id uuid primary key
    references public.profiles (id)
    on delete cascade,

  step_free_access boolean not null default false,
  seating_available boolean not null default false,
  low_sensory_environment boolean not null default false,
  captioning boolean not null default false,
  asl_interpretation boolean not null default false,
  accessible_restroom boolean not null default false,
  mobility_device_access boolean not null default false,
  virtual_participation boolean not null default false,
  written_instructions boolean not null default false,
  breaks_available boolean not null default false,

  additional_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint accessibility_notes_length
    check (
      additional_notes is null
      or char_length(additional_notes) <= 500
    )
);

create trigger connection_preferences_set_updated_at
before update on public.profile_connection_preferences
for each row execute function public.set_updated_at();

create trigger accessibility_preferences_set_updated_at
before update on public.profile_accessibility_preferences
for each row execute function public.set_updated_at();

alter table public.profile_connection_preferences
enable row level security;

alter table public.profile_accessibility_preferences
enable row level security;

create policy "connection_preferences_select_own"
on public.profile_connection_preferences
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "accessibility_preferences_select_own"
on public.profile_accessibility_preferences
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.profile_connection_preferences
from anon, authenticated;

revoke all on public.profile_accessibility_preferences
from anon, authenticated;

grant select on public.profile_connection_preferences
to authenticated;

grant select on public.profile_accessibility_preferences
to authenticated;

grant usage on type
  public.location_visibility,
  public.friend_list_visibility
to authenticated;

create or replace function public.complete_signal_onboarding(
  p_username text,
  p_display_name text,
  p_pronouns text,
  p_timezone text,
  p_interest_ids uuid[],
  p_skill_ids uuid[],

  p_bio text,
  p_city text,
  p_region text,
  p_country_code text,
  p_location_visibility public.location_visibility,
  p_friend_list_visibility public.friend_list_visibility,
  p_discoverable boolean,

  p_open_to_friends boolean,
  p_open_to_activity_partners boolean,
  p_open_to_creative_collaboration boolean,
  p_open_to_professional_networking boolean,
  p_open_to_mentorship boolean,
  p_open_to_volunteering boolean,
  p_open_to_gaming boolean,
  p_open_to_travel_groups boolean,

  p_prefer_local boolean,
  p_prefer_virtual boolean,

  p_allow_friend_requests boolean,
  p_allow_circle_invites boolean,
  p_allow_event_invites boolean,
  p_show_in_mutual_connections boolean,

  p_step_free_access boolean,
  p_seating_available boolean,
  p_low_sensory_environment boolean,
  p_captioning boolean,
  p_asl_interpretation boolean,
  p_accessible_restroom boolean,
  p_mobility_device_access boolean,
  p_virtual_participation boolean,
  p_written_instructions boolean,
  p_breaks_available boolean,
  p_accessibility_notes text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_country_code text;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if p_bio is not null and char_length(btrim(p_bio)) > 500 then
    raise exception 'Bio is too long'
      using errcode = '22023';
  end if;

  if p_city is not null and char_length(btrim(p_city)) > 100 then
    raise exception 'City is too long'
      using errcode = '22023';
  end if;

  if p_region is not null and char_length(btrim(p_region)) > 100 then
    raise exception 'Region is too long'
      using errcode = '22023';
  end if;

  normalized_country_code :=
    nullif(upper(btrim(coalesce(p_country_code, ''))), '');

  if normalized_country_code is not null
     and normalized_country_code !~ '^[A-Z]{2}$' then
    raise exception 'Invalid country code'
      using errcode = '22023';
  end if;

  if p_accessibility_notes is not null
     and char_length(btrim(p_accessibility_notes)) > 500 then
    raise exception 'Accessibility notes are too long'
      using errcode = '22023';
  end if;

  perform public.complete_onboarding(
    p_username,
    p_display_name,
    p_pronouns,
    p_timezone,
    p_interest_ids,
    p_skill_ids
  );

  update public.profiles
  set
    bio = nullif(btrim(p_bio), ''),
    city = nullif(btrim(p_city), ''),
    region = nullif(btrim(p_region), ''),
    country_code = normalized_country_code,
    location_visibility = p_location_visibility,
    friend_list_visibility = p_friend_list_visibility,
    discoverable = p_discoverable
  where id = current_user_id;

  if not found then
    raise exception 'Profile not found'
      using errcode = 'P0002';
  end if;

  insert into public.profile_connection_preferences (
    user_id,
    open_to_friends,
    open_to_activity_partners,
    open_to_creative_collaboration,
    open_to_professional_networking,
    open_to_mentorship,
    open_to_volunteering,
    open_to_gaming,
    open_to_travel_groups,
    prefer_local,
    prefer_virtual,
    allow_friend_requests,
    allow_circle_invites,
    allow_event_invites,
    show_in_mutual_connections
  )
  values (
    current_user_id,
    p_open_to_friends,
    p_open_to_activity_partners,
    p_open_to_creative_collaboration,
    p_open_to_professional_networking,
    p_open_to_mentorship,
    p_open_to_volunteering,
    p_open_to_gaming,
    p_open_to_travel_groups,
    p_prefer_local,
    p_prefer_virtual,
    p_allow_friend_requests,
    p_allow_circle_invites,
    p_allow_event_invites,
    p_show_in_mutual_connections
  )
  on conflict (user_id) do update
  set
    open_to_friends = excluded.open_to_friends,
    open_to_activity_partners = excluded.open_to_activity_partners,
    open_to_creative_collaboration =
      excluded.open_to_creative_collaboration,
    open_to_professional_networking =
      excluded.open_to_professional_networking,
    open_to_mentorship = excluded.open_to_mentorship,
    open_to_volunteering = excluded.open_to_volunteering,
    open_to_gaming = excluded.open_to_gaming,
    open_to_travel_groups = excluded.open_to_travel_groups,
    prefer_local = excluded.prefer_local,
    prefer_virtual = excluded.prefer_virtual,
    allow_friend_requests = excluded.allow_friend_requests,
    allow_circle_invites = excluded.allow_circle_invites,
    allow_event_invites = excluded.allow_event_invites,
    show_in_mutual_connections =
      excluded.show_in_mutual_connections;

  insert into public.profile_accessibility_preferences (
    user_id,
    step_free_access,
    seating_available,
    low_sensory_environment,
    captioning,
    asl_interpretation,
    accessible_restroom,
    mobility_device_access,
    virtual_participation,
    written_instructions,
    breaks_available,
    additional_notes
  )
  values (
    current_user_id,
    p_step_free_access,
    p_seating_available,
    p_low_sensory_environment,
    p_captioning,
    p_asl_interpretation,
    p_accessible_restroom,
    p_mobility_device_access,
    p_virtual_participation,
    p_written_instructions,
    p_breaks_available,
    nullif(btrim(p_accessibility_notes), '')
  )
  on conflict (user_id) do update
  set
    step_free_access = excluded.step_free_access,
    seating_available = excluded.seating_available,
    low_sensory_environment =
      excluded.low_sensory_environment,
    captioning = excluded.captioning,
    asl_interpretation = excluded.asl_interpretation,
    accessible_restroom = excluded.accessible_restroom,
    mobility_device_access = excluded.mobility_device_access,
    virtual_participation = excluded.virtual_participation,
    written_instructions = excluded.written_instructions,
    breaks_available = excluded.breaks_available,
    additional_notes = excluded.additional_notes;
end;
$$;

revoke all on function public.complete_signal_onboarding(
  text,
  text,
  text,
  text,
  uuid[],
  uuid[],
  text,
  text,
  text,
  text,
  public.location_visibility,
  public.friend_list_visibility,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
    boolean,

  text
) from public;

grant execute on function public.complete_signal_onboarding(
  text,
  text,
  text,
  text,
  uuid[],
  uuid[],
  text,
  text,
  text,
  text,
  public.location_visibility,
  public.friend_list_visibility,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
    boolean,

  text
) to authenticated;