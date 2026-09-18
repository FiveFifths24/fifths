"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  requestType: z.enum(["deactivation", "deletion"]),
  memberNote: z.string().trim().max(500).optional(),
});

const cancelSchema = z.object({ requestId: z.string().uuid() });

export async function requestAccountDataAction(formData: FormData) {
  const parsed = requestSchema.safeParse({
    requestType: formData.get("requestType"),
    memberNote: formData.get("memberNote") || undefined,
  });
  if (!parsed.success) redirect("/account/data?request=invalid");

  let outcome: "submitted" | "error" = "submitted";
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("request_account_data_action", {
      p_request_type: parsed.data.requestType,
      p_member_note: parsed.data.memberNote ?? null,
    });
    if (error) outcome = "error";
  } catch {
    outcome = "error";
  }

  if (outcome === "submitted") revalidatePath("/account/data");
  redirect(`/account/data?request=${outcome}`);
}

export async function cancelAccountDataRequestAction(formData: FormData) {
  const parsed = cancelSchema.safeParse({
    requestId: formData.get("requestId"),
  });
  if (!parsed.success) redirect("/account/data?cancel=invalid");

  let outcome: "cancelled" | "error" = "cancelled";
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("cancel_account_data_request", {
      p_request_id: parsed.data.requestId,
    });
    if (error) outcome = "error";
  } catch {
    outcome = "error";
  }

  if (outcome === "cancelled") revalidatePath("/account/data");
  redirect(`/account/data?cancel=${outcome}`);
}
