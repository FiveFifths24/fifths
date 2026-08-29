"use client";

import { useEffect } from "react";
import { touchProfilePresenceAction } from "./actions";

const HEARTBEAT_MS = 4 * 60 * 1000;

export function ProfilePresenceHeartbeat() {
  useEffect(() => {
    const touch = () => {
      if (document.visibilityState === "visible") {
        void touchProfilePresenceAction();
      }
    };

    touch();
    const timer = window.setInterval(touch, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", touch);
    window.addEventListener("focus", touch);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", touch);
      window.removeEventListener("focus", touch);
    };
  }, []);

  return null;
}
