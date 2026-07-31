"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";

const navigation = [
  { href: "/ecosystem", label: "Ecosystem" },
  { href: "/about", label: "About" },
  { href: "/community-guidelines", label: "Community" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800/90 bg-black/90 backdrop-blur-xl">
      <Container className="flex min-h-18 items-center justify-between gap-5">
        <Link
          className="flex min-h-12 items-center text-lg font-black tracking-[0.16em] text-white"
          href="/"
          aria-label="FIFTHS home"
        >
          FIFTHS<span className="text-red-500">.</span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {navigation.map((item) => (
            <Link
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-neutral-400 transition-colors hover:text-white",
                isActive(pathname, item.href) && "bg-neutral-900 text-white",
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ButtonLink href="/login" variant="quiet">
            Log in
          </ButtonLink>
          <ButtonLink href="/signup">Join FIFTHS</ButtonLink>
        </div>

        <button
          aria-controls={menuId}
          aria-expanded={open}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex size-12 items-center justify-center rounded-full border border-neutral-700 text-white md:hidden"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          {open ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <Menu aria-hidden="true" className="size-5" />
          )}
        </button>
      </Container>

      {open ? (
        <div
          className="border-t border-neutral-800 bg-black md:hidden"
          id={menuId}
        >
          <Container className="py-5">
            <nav aria-label="Mobile navigation" className="grid gap-2">
              {navigation.map((item) => (
                <Link
                  aria-current={
                    isActive(pathname, item.href) ? "page" : undefined
                  }
                  className={cn(
                    "flex min-h-12 items-center rounded-xl px-4 font-semibold text-neutral-300",
                    isActive(pathname, item.href) &&
                      "bg-neutral-900 text-white",
                  )}
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-neutral-800 pt-5">
                <ButtonLink href="/login" variant="secondary">
                  Log in
                </ButtonLink>
                <ButtonLink href="/signup">Join FIFTHS</ButtonLink>
              </div>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
