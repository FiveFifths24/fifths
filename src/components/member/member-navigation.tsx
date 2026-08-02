"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Clock3, House, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/home", label: "Home", icon: House },
  { href: "/home/pulse", label: "Check Pulse", icon: Activity },
  { href: "/home/pulse/history", label: "History", icon: Clock3 },
  { href: "/account", label: "Account", icon: UserRound },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href;
}

export function MemberNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Member navigation" className="mt-8">
      <ul className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors sm:px-5",
                  active
                    ? "border-red-700 bg-red-950/50 text-white"
                    : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-600 hover:text-white",
                )}
                href={item.href}
              >
                <Icon aria-hidden="true" className="size-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
