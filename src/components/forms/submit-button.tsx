"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";

export function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className={cn(
        "min-h-12 w-full rounded-full bg-red-700 px-6 py-3 font-bold text-white transition-colors hover:bg-red-600 disabled:cursor-wait disabled:bg-neutral-700 disabled:text-neutral-300",
        className,
      )}
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
