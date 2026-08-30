alter table public.profile_featured_connections
drop constraint if exists profile_featured_order_range;

alter table public.profile_featured_connections
add constraint profile_featured_order_range
check (display_order between 1 and 8);

create or replace function public.set_featured_connections(
  p_featured_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if cardinality(p_featured_ids) > 8 then
    raise exception 'Choose no more than 8 featured connections'
      using errcode = '22023';
  end if;

  if cardinality(p_featured_ids) <> (
    select count(distinct featured_id)
    from unnest(p_featured_ids) featured_id
  ) then
    raise exception 'Featured connections must be unique'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from unnest(p_featured_ids) featured_id
    where not public.profiles_are_friends(current_user_id, featured_id)
       or public.profiles_are_blocked(current_user_id, featured_id)
  ) then
    raise exception 'Only current friends can be featured'
      using errcode = '22023';
  end if;

  delete from public.profile_featured_connections
  where owner_id = current_user_id;

  insert into public.profile_featured_connections (
    owner_id,
    featured_id,
    display_order
  )
  select
    current_user_id,
    featured_id,
    ordinal::smallint
  from unnest(p_featured_ids)
  with ordinality selected(featured_id, ordinal);
end;
$$;

revoke all on function public.set_featured_connections(uuid[]) from public;

grant execute on function public.set_featured_connections(uuid[])
to authenticated;