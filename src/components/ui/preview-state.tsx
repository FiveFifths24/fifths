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
    <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-950/70 p-5">
      <div className="flex items-center gap-2 text-sm font-bold text-white">
        <Eye aria-hidden="true" className="size-4 text-red-400" />
        {title}
      </div>
      <div className="mt-2 text-sm leading-6 text-neutral-400">{children}</div>
    </div>
  );
}
