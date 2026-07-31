import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

type ButtonLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode;
    variant?: "primary" | "secondary" | "quiet";
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
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-colors",
        variant === "primary" && "bg-red-700 text-white hover:bg-red-600",
        variant === "secondary" &&
          "border border-neutral-600 bg-neutral-950 text-white hover:border-neutral-400 hover:bg-neutral-900",
        variant === "quiet" &&
          "px-0 text-neutral-200 underline decoration-neutral-600 underline-offset-4 hover:text-white",
        className,
      )}
      {...props}
    >
      {children}
      {arrow ? <ArrowUpRight aria-hidden="true" className="size-4" /> : null}
    </Link>
  );
}
