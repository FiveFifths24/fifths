"use client";

import { useState } from "react";

export function ShareProfileButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: "SIGNAL profile", url });
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
      className="min-h-11 rounded-full border border-white/15 px-5 py-2 text-sm font-bold text-white hover:border-[#ca9aff]/60"
      onClick={share}
      type="button"
    >
      {copied ? "Profile link copied" : "Share profile"}
    </button>
  );
}
