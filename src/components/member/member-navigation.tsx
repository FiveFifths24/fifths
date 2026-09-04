"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarRange,
  Compass,
  HeartHandshake,
  House,
  UsersRound,
} from "lucide-react";

import { cn } from "@/lib/cn";

const items = [
  {
    href: "/home",
    label: "Home",
    icon: House,
  },
  {
    href: "/home/circles",
    label: "Circles",
    icon: HeartHandshake,
    nested: true,
  },
  {
    href: "/home/sessions",
    label: "Sessions",
    icon: CalendarRange,
    nested: true,
  },
  {
    href: "/home/notifications",
    label: "Inbox",
    icon: Bell,
    nested: true,
  },
  {
    href: "/home/people",
    label: "People",
    icon: UsersRound,
    nested: true,
  },
  {
    href: "/home/discover",
    label: "Discover",
    icon: Compass,
    nested: true,
  },
] as const;

function isActive(pathname: string, item: (typeof items)[number]) {
  return (
    pathname === item.href ||
    ("nested" in item && item.nested && pathname.startsWith(`${item.href}/`))
  );
}

export function MemberNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Member navigation"
      className="mt-6 flex flex-wrap justify-center gap-2"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold backdrop-blur-sm transition-all duration-300 sm:px-5",
              active
                ? "border-[#ca9aff]/50 bg-[#6c14ce]/20 text-white shadow-[0_0_24px_rgba(108,20,206,0.14)]"
                : "border-white/10 bg-white/[0.035] text-white/55 hover:border-[#ca9aff]/30 hover:bg-[#6c14ce]/10 hover:text-white",
            )}
            href={item.href}
            key={item.href}
          >
            <Icon
              aria-hidden="true"
              className={cn(
                "size-4",
                active ? "text-[#ca9aff]" : "text-white/40",
              )}
            />

            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
