import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseEnvironment } from "@/lib/env";
import type { Database } from "@/types/database";

export function createClient() {
  const environment = requireSupabaseEnvironment();
  return createBrowserClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
