create or replace function public.delete_creator_opportunity(
  p_opportunity_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_opportunity public.creator_opportunities%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select *
  into current_opportunity
  from public.creator_opportunities
  where id = p_opportunity_id
  for update;

  if not found then
    raise exception 'Opportunity not found' using errcode = '22023';
  end if;

  if not public.can_manage_creator_opportunity(p_opportunity_id) then
    raise exception 'Opportunity deletion denied' using errcode = '42501';
  end if;

if exists (
  select 1
  from public.opportunity_responses response
  join public.creator_opportunities opportunity
    on opportunity.id = response.opportunity_id
  where response.opportunity_id = p_opportunity_id
    and response.user_id <> opportunity.created_by
) then
  raise exception 'Opportunity has member responses';
end if;

  delete from public.creator_opportunities
  where id = p_opportunity_id;
end;
$$;

revoke all on function public.delete_creator_opportunity(uuid) from public;
grant execute on function public.delete_creator_opportunity(uuid) to authenticated;


create or replace function public.delete_circle(
  p_circle_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_circle public.circles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select *
  into current_circle
  from public.circles
  where id = p_circle_id
  for update;

  if not found then
    raise exception 'Circle not found' using errcode = '22023';
  end if;

  if current_circle.created_by <> auth.uid()
     and not public.has_role('platform_admin') then
    raise exception 'Circle deletion denied' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.circle_members
    where circle_id = p_circle_id
      and user_id <> current_circle.created_by
  ) then
    raise exception 'Circle has member interaction and cannot be deleted'
      using errcode = '22023';
  end if;

  delete from public.circles
  where id = p_circle_id;
end;
$$;

revoke all on function public.delete_circle(uuid) from public;
grant execute on function public.delete_circle(uuid) to authenticated;