create or replace function public.set_second_featured_profile_image(
  p_featured_profile_image_2_url text
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
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  update public.profiles
  set featured_profile_image_2_url = p_featured_profile_image_2_url
  where id = current_user_id;
end;
$$;

revoke all on function public.set_second_featured_profile_image(text)
from public;

grant execute on function public.set_second_featured_profile_image(text)
to authenticated;