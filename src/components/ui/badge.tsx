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
        "inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs font-semibold text-neutral-200",
        className,
      )}
    >
      {children}
    </span>
  );
}
