"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function openDirectConversationAction(formData: FormData) {
  const targetUserId = String(formData.get("targetUserId") ?? "").trim();

  if (!targetUserId) {
    redirect("/home/people");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_or_create_direct_conversation",
    {
      p_target_user_id: targetUserId,
    },
  );

  if (error || !data) {
    console.error("get_or_create_direct_conversation failed:", error);
    redirect("/home/people");
  }

  redirect(`/home/messages/${data}`);
}

export async function sendDirectMessageAction(formData: FormData) {
  const conversationId = String(
    formData.get("conversationId") ?? "",
  ).trim();

  const body = String(formData.get("body") ?? "").trim();

  if (!conversationId || !body) {
    redirect(`/home/messages/${conversationId}`);
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("send_direct_message", {
    p_conversation_id: conversationId,
    p_body: body,
  });

  if (error) {
    console.error("send_direct_message failed:", error);
  }

  redirect(`/home/messages/${conversationId}`);
}