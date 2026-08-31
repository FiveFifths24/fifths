create or replace function public.set_spotlight_category(
  p_spotlight_category text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  update public.profiles
  set
    spotlight_category = nullif(trim(p_spotlight_category), ''),
    updated_at = now()
  where id = auth.uid();
end;
$$;

revoke all on function public.set_spotlight_category(text) from public;
grant execute on function public.set_spotlight_category(text) to authenticated;
