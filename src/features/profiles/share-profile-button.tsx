"use client";

import { useState } from "react";

export function ShareProfileButton({
  path,
}: {
  path: string;
  accentColor: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(path, window.location.origin).toString();

    try {
      if (navigator.share) {
        await navigator.share({
          title: "SIGNAL profile",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2_000);
      }
    } catch {
      // Closing the native share sheet is not an error the visitor must handle.
    }
  }

  return (
    <button
      className="flex min-h-11 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.035] px-5 py-2.5 text-center text-sm font-bold text-white transition hover:border-white/20 hover:bg-white/[0.07] md:w-auto"
      onClick={share}
      type="button"
    >
      {copied ? "Profile Link Copied" : "Share Profile"}
    </button>
  );
}
