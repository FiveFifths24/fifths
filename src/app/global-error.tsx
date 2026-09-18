"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("SIGNAL global error", error.digest ?? "no-digest");
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#020205] text-white">
        <main className="flex min-h-screen items-center justify-center p-6">
          <section className="w-full max-w-2xl rounded-[2rem] border border-[#f359d2]/30 bg-black/55 p-8 text-center sm:p-12">
            <p className="text-xs font-black tracking-[0.2em] text-[#f359d2] uppercase">
              SIGNAL needs a moment
            </p>
            <h1 className="display-type mt-4 text-5xl">
              We couldn&apos;t restore this view.
            </h1>
            <p className="mt-5 text-base leading-7 text-neutral-300">
              No technical details are exposed here. Try again, or return to
              SIGNAL after refreshing the page.
            </p>
            <button
              className="mt-8 min-h-12 rounded-full bg-white px-7 py-3 text-sm font-black text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              onClick={reset}
              type="button"
            >
              Try Again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
