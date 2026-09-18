create or replace function public.set_realm_campaign_status(
  p_campaign_id uuid,
  p_status public.realm_campaign_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_campaign public.realm_campaigns%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select *
  into current_campaign
  from public.realm_campaigns
  where id = p_campaign_id
  for update;

  if not found or not public.can_manage_realm_campaign(p_campaign_id) then
    raise exception 'Campaign management denied' using errcode = '42501';
  end if;

  if p_status = 'recruiting'
     and current_campaign.status = 'draft'
     and current_campaign.application_deadline > now() then

    update public.realm_campaigns
    set status = 'recruiting',
        published_at = now()
    where id = p_campaign_id;

  elsif p_status = 'active'
        and current_campaign.status = 'recruiting' then

    update public.realm_campaigns
    set status = 'active',
        recruiting_closed_at = now()
    where id = p_campaign_id;

  elsif p_status = 'completed'
        and current_campaign.status = 'active' then

    update public.realm_campaigns
    set status = 'completed',
        completed_at = now()
    where id = p_campaign_id;

  elsif p_status = 'cancelled'
        and current_campaign.status in ('draft', 'recruiting', 'active') then

    update public.realm_campaigns
    set status = 'cancelled',
        recruiting_closed_at = coalesce(recruiting_closed_at, now())
    where id = p_campaign_id;

  else
    raise exception 'Invalid campaign status transition'
      using errcode = '22023';
  end if;
end;
$$;

create or replace function public.delete_realm_campaign(
  p_campaign_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_campaign public.realm_campaigns%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select *
  into current_campaign
  from public.realm_campaigns
  where id = p_campaign_id
  for update;

  if not found then
    raise exception 'Campaign not found' using errcode = '22023';
  end if;

  if current_campaign.created_by <> auth.uid()
     and not public.has_role('platform_admin') then
    raise exception 'Campaign deletion denied' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.campaign_applications
    where campaign_id = p_campaign_id
  ) then
    raise exception 'Campaign has member applications and cannot be deleted'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.campaign_members
    where campaign_id = p_campaign_id
      and role = 'player'
  ) then
    raise exception 'Campaign has player participation and cannot be deleted'
      using errcode = '22023';
  end if;

  delete from public.realm_campaigns
  where id = p_campaign_id;
end;
$$;

revoke all on function public.delete_realm_campaign(uuid) from public;
grant execute on function public.delete_realm_campaign(uuid) to authenticated;