import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function signProfileMedia(
  supabase: SupabaseClient<Database>,
  path: string | null,
) {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from("profile-media")
    .createSignedUrl(path, 60 * 60);
  return error ? null : data.signedUrl;
}
