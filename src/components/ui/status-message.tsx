import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { cn } from "@/lib/cn";

export function StatusMessage({
  children,
  tone = "info",
  className,
}: {
  children: ReactNode;
  tone?: "info" | "success" | "error";
  className?: string;
}) {
  const Icon =
    tone === "success" ? CircleCheck : tone === "error" ? CircleAlert : Info;
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border p-4 text-sm leading-6",
        tone === "info" && "border-blue-900/70 bg-blue-950/30 text-blue-100",
        tone === "success" &&
          "border-emerald-900/70 bg-emerald-950/30 text-emerald-100",
        tone === "error" && "border-red-900/70 bg-red-950/30 text-red-100",
        className,
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
