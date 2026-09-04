import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || secret.length < 32 || !authorization?.startsWith("Bearer ")) {
    return false;
  }
  const supplied = authorization.slice("Bearer ".length);
  const expectedBytes = Buffer.from(secret);
  const suppliedBytes = Buffer.from(supplied);
  return (
    suppliedBytes.length === expectedBytes.length &&
    timingSafeEqual(suppliedBytes, expectedBytes)
  );
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = createServiceClient();
  const { data: records, error } = await supabase
    .from("media_moderation_records")
    .select("id, quarantine_path, status")
    .is("quarantine_deleted_at", null)
    .lt("expires_at", new Date().toISOString())
    .in("status", ["pending", "review", "rejected", "error"])
    .order("expires_at", { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }

  let cleaned = 0;
  for (const record of records ?? []) {
    const { error: removeError } = await supabase.storage
      .from("media-quarantine")
      .remove([record.quarantine_path]);
    if (removeError) continue;

    const update = {
      status: record.status === "rejected" ? "rejected" : "expired",
      quarantine_deleted_at: new Date().toISOString(),
      decision_reason:
        record.status === "rejected"
          ? "automated_rejected"
          : "quarantine_retention_expired",
    } as const;
    const { error: updateError } = await supabase
      .from("media_moderation_records")
      .update(update)
      .eq("id", record.id);
    if (!updateError) cleaned += 1;
  }

  return NextResponse.json({ cleaned });
}
