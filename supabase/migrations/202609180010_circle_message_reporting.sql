alter type public.report_target_type
  add value if not exists 'circle_message';

notify pgrst, 'reload schema';