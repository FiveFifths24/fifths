create or replace function public.set_profile_current_fields(
  p_current_game text,
  p_current_reading text,
  p_current_food text
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
  set
    current_game = p_current_game,
    current_reading = p_current_reading,
    current_food = p_current_food
  where id = current_user_id;
end;
$$;

revoke all on function public.set_profile_current_fields(text, text, text)
from public;

grant execute on function public.set_profile_current_fields(text, text, text)
to authenticated;