"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function CircleChatRealtime({ circleId }: { circleId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`circle-chat:${circleId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "circle_messages",
          filter: `circle_id=eq.${circleId}`,
        },
        () => {
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [circleId, router]);

  return null;
}
