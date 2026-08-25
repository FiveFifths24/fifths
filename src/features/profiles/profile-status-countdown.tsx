"use client";

import { useEffect, useState } from "react";

export function ProfileStatusCountdown({ expiresAt }: { expiresAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const remainingMinutes = Math.max(
    0,
    Math.ceil((new Date(expiresAt).getTime() - now) / 60_000),
  );
  if (!remainingMinutes) return <span>Expires momentarily</span>;
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;
  return (
    <span>
      {hours ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`}
    </span>
  );
}
