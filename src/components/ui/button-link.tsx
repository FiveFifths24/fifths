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
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all duration-300",
        variant === "primary" &&
variant === "secondary" &&
  "border border-[#6100cc]/30 bg-black/45 text-white hover:border-[#6100cc]/40 hover:bg-white/10",
variant === "ecosystem" &&
  "ecosystem-gradient-button bg-transparent text-[#f359d2] backdrop-blur-sm",
    variant === "quiet" &&
          "px-0 text-[#d8d3df] underline decoration-[#6c14ce]/60 underline-offset-4 hover:text-white",
        className,
      )}
      {...props}
    >
      {children}
      {arrow ? <ArrowUpRight aria-hidden="true" className="size-4" /> : null}
    </Link>
  );
}
