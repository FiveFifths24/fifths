"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { ButtonLink } from "@/components/ui/button-link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Production logging can consume the digest without showing internals.
    console.error("SIGNAL route error", error.digest ?? "no-digest");
  }, [error]);

  return (
    <section className="mx-auto my-16 max-w-3xl rounded-[2rem] border border-red-400/25 bg-black/55 p-7 text-center text-white shadow-[0_20px_70px_rgba(0,0,0,.4)] sm:p-10">
      <AlertTriangle
        aria-hidden="true"
        className="mx-auto size-10 text-red-300"
      />
      <p className="mt-5 text-xs font-black tracking-[0.18em] text-red-300 uppercase">
        Signal interrupted
      </p>
      <h1 className="mt-3 text-3xl font-black sm:text-4xl">
        This part of SIGNAL could not load.
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-300">
        Your submitted information may still be saved. Try this view again
        before repeating a completed action.
      </p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          onClick={reset}
          type="button"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Try Again
        </button>
        <ButtonLink href="/home" variant="secondary">
          Return to Home
        </ButtonLink>
      </div>
    </section>
  );
}
