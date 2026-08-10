"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";

export function SubmitButton({
  children,
  pendingLabel,
  className,
  variant = "primary",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className={cn(
        "min-h-12 w-full rounded-full border px-6 py-3 font-bold text-white transition-colors disabled:cursor-wait disabled:border-neutral-700 disabled:bg-neutral-700 disabled:text-neutral-300",
        variant === "primary" &&
          "border-transparent bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#f359d2] hover:brightness-110",
        variant === "secondary" &&
          "border-neutral-600 bg-neutral-950 hover:border-neutral-400 hover:bg-neutral-900",
        variant === "danger" &&
          "border-red-800 bg-red-950 text-red-100 hover:border-red-600 hover:bg-red-900",
        className,
      )}
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
