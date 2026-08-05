import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#6c14ce]/35 bg-[#6c14ce]/10 px-3 py-1 text-xs font-semibold text-[#d8b4fe] shadow-[0_0_18px_rgba(108,20,206,0.08)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
