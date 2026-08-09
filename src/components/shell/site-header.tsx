"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Menu, X } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(Boolean(data.user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <header
      className={cn(
        "z-50",
        pathname === "/"
          ? "absolute inset-x-0 top-0 bg-transparent"
          : "sticky top-0 border-b border-neutral-800/90 bg-black/90 backdrop-blur-xl",
      )}
    >
      <Container
        className={cn(
          "flex min-h-18 items-center justify-between gap-5",
          pathname === "/" && "!mx-0 !max-w-none px-5 sm:px-8 lg:px-16",
        )}
      >
        <Link
          className="flex min-h-12 flex-col justify-center leading-none"
          href="/"
          aria-label="SIGNAL powered by FIVE FIFTHS"
        >
          <span className="text-lg font-black tracking-[0.16em] text-white uppercase">
            SIGNAL<span className="text-[#f359d2]">.</span>
          </span>

          <span className="mt-1 text-[0.42rem] font-bold tracking-[0.18em] text-white/60 uppercase">
            Powered by FIVE FIFTHS
          </span>
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

        <div className="hidden items-center md:flex">
<ButtonLink href={isLoggedIn ? "/account" : "/login"} variant="quiet">
  {isLoggedIn ? "Account" : "Log in"}
</ButtonLink>
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

              <div className="mt-3 border-t border-neutral-800 pt-5">
<ButtonLink
  className="w-full border-0 bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_36%,#f359d2_70%,#7cff00_100%)] text-white shadow-[0_0_20px_rgba(108,20,206,0.2)] hover:brightness-110"
  href={isLoggedIn ? "/account" : "/login"}
>
  {isLoggedIn ? "Account" : "Log in"}
</ButtonLink>
              </div>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
