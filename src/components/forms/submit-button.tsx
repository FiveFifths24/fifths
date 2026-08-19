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
        "min-h-12 w-full rounded-full border px-6 py-3 font-bold text-white transition-all focus:ring-2 focus:ring-[#f359d2]/50 focus:ring-offset-2 focus:ring-offset-black focus:outline-none disabled:cursor-wait disabled:border-neutral-700 disabled:bg-neutral-700 disabled:text-neutral-300 disabled:shadow-none",
        variant === "primary" &&
          "border-transparent bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#f359d2] shadow-lg shadow-[#992bff]/25 hover:-translate-y-0.5 hover:shadow-[#f359d2]/25 hover:brightness-110 active:translate-y-0",
        variant === "secondary" &&
          "border-[#992bff]/35 bg-black/70 hover:border-[#992bff]/65 hover:bg-[#992bff]/10",
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
