"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || document.hidden) return;

    void fetch("/api/analytics", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventName: "page_view", route: pathname }),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
