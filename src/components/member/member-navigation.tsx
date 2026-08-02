"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Aperture,
  CalendarRange,
  HeartHandshake,
  House,
  Orbit,
  TicketCheck,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/home", label: "Home", icon: House },
  { href: "/home/pulse", label: "Pulse", icon: Activity, nested: true },
  {
    href: "/home/sessions",
    label: "Sessions",
    icon: CalendarRange,
    nested: true,
  },
  {
    href: "/home/circles",
    label: "Circles",
    icon: HeartHandshake,
    nested: true,
  },
  {
    href: "/home/commons",
    label: "Commons",
    icon: Aperture,
    nested: true,
  },
  {
    href: "/home/realm",
    label: "Realm",
    icon: Orbit,
    nested: true,
  },
  {
    href: "/home/registrations",
    label: "Registrations",
    icon: TicketCheck,
  },
  { href: "/account", label: "Account", icon: UserRound },
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
    <nav aria-label="Member navigation" className="mt-8">
      <ul className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item);
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
