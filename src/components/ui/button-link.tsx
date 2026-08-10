import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/cn";

type ButtonLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode;
    variant?: "primary" | "secondary" | "quiet" | "ecosystem";
    arrow?: boolean;
  };

export function ButtonLink({
  children,
  className,
  variant = "primary",
  arrow = false,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
"inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300",
variant === "primary" &&
  "border border-white/10 bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#f359d2] text-white shadow-lg shadow-[#6c14ce]/20 hover:brightness-110 hover:shadow-[#a855f7]/25",
variant === "secondary" &&
  "border border-[#6c14ce]/25 bg-white/[0.04] text-white/75 backdrop-blur-sm hover:border-[#ca9aff]/40 hover:bg-[#6c14ce]/10 hover:text-white",
          variant === "ecosystem" &&
          "ecosystem-gradient-button bg-transparent text-[#f359d2] backdrop-blur-sm",
variant === "quiet" &&
  "min-h-0 px-0 py-0 text-[#ca9aff] hover:text-[#f359d2]", 
         className,
      )}
      {...props}
    >
      {children}
      {arrow ? <ArrowUpRight aria-hidden="true" className="size-4" /> : null}
    </Link>
  );
}
