import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnalyticsEvent } from "./events";
import type { Database } from "@/types/database";

export async function recordAnalyticsSafely(
  supabase: SupabaseClient<Database>,
  event: AnalyticsEvent,
) {
  try {
    await supabase.rpc("record_product_analytics_event", {
      p_event_name: event.eventName,
      p_route: event.route ?? null,
      p_entity_type: event.entityType ?? null,
      p_entity_id: event.entityId ?? null,
      p_properties: event.properties ?? {},
    });
  } catch {
    // Product behavior must never depend on analytics availability.
  }
}
