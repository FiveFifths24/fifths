import { NextResponse } from "next/server";
import { analyticsEventSchema } from "@/lib/analytics/events";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const parsed = analyticsEventSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    // Anonymous traffic is intentionally not assigned an identifier. A future
    // public analytics provider requires a separate consent/legal decision.
    if (!userData.user) return new NextResponse(null, { status: 204 });

    await supabase.rpc("record_product_analytics_event", {
      p_event_name: parsed.data.eventName,
      p_route: parsed.data.route ?? null,
      p_entity_type: parsed.data.entityType ?? null,
      p_entity_id: parsed.data.entityId ?? null,
      p_properties: parsed.data.properties ?? {},
    });
  } catch {
    // Analytics must never block or change the member's product flow.
  }

  return new NextResponse(null, { status: 204 });
}
