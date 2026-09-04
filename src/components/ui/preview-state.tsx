import type { ReactNode } from "react";
import { Eye } from "lucide-react";

export function PreviewState({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#6c14ce]/40 bg-[#0b0813]/80 p-5 text-center shadow-[0_18px_50px_rgba(108,20,206,0.08)] sm:text-left">
      <div className="flex items-center justify-center gap-2 text-sm font-bold text-white sm:justify-start">
        <Eye aria-hidden="true" className="size-4 text-[#f359d2]" />
        {title}
      </div>

      <div className="mt-2 text-sm leading-6 text-[#b6b1c2]">{children}</div>
    </div>
  );
}
