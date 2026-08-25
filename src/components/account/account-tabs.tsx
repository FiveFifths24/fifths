import Link from "next/link";
import { House, ShieldCheck } from "lucide-react";

const tabs = [
  {
    href: "/account",
    label: "Edit My Room",
    icon: House,
  },
  {
    href: "/account/safety",
    label: "Safety & connections",
    icon: ShieldCheck,
  },
] as const;

export function AccountTabs({ active }: { active: "profile" | "safety" }) {
  return (
    <nav
      aria-label="Account settings"
      className="mt-8 grid gap-3 rounded-[1.5rem] border border-white/10 bg-black/35 p-2 sm:inline-grid sm:grid-cols-2"
    >
      {tabs.map((tab) => {
        const isActive =
          (active === "profile" && tab.href === "/account") ||
          (active === "safety" && tab.href === "/account/safety");
        const Icon = tab.icon;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-[1.1rem] bg-[linear-gradient(90deg,#6c14ce,#992bff,#f359d2)] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_35px_rgba(153,43,255,.22)]"
                : "inline-flex min-h-12 items-center justify-center gap-2 rounded-[1.1rem] px-5 py-3 text-sm font-bold text-white/55 transition hover:bg-white/5 hover:text-white"
            }
            href={tab.href}
            key={tab.href}
          >
            <Icon aria-hidden="true" className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
