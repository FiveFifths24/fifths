"use client";

import Link from "next/link";
import {
  Bell,
  CircleUserRound,
  Compass,
  House,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { signOutAction } from "@/features/auth/actions";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";

export function SiteHeader() {
  const pathname = usePathname();
  const menuId = useId();

  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function verifyUser() {
      const { data, error } = await supabase.auth.getUser();

      if (active) {
        setIsLoggedIn(!error && Boolean(data.user));
      }
    }

    void verifyUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) {
        return;
      }

      if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setIsLoggedIn(Boolean(session?.user));
      }
    });

    return () => {
      active = false;
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
          : "sticky top-0 border-b border-[#f359d2]/40 bg-black/90 backdrop-blur-xl",
      )}
    >
      <Container
        className={cn(
          "flex min-h-18 items-center justify-between gap-5",
          pathname === "/" && "!mx-0 !max-w-none px-5 sm:px-8 lg:px-16",
        )}
      >
        <Link
          aria-label="SIGNAL powered by FIVE FIFTHS"
          className="flex min-h-12 flex-col justify-center leading-none"
          href="/"
        >
          <span className="text-lg font-black tracking-[0.16em] text-white uppercase">
            SIGNAL<span className="text-[#f359d2]">.</span>
          </span>

          <span className="mt-1 text-[0.42rem] font-bold tracking-[0.18em] text-white/60 uppercase">
            Powered by FIVE FIFTHS
          </span>
        </Link>

        <button
          aria-controls={menuId}
          aria-expanded={open}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          className="relative z-[100] inline-flex min-h-12 min-w-12 touch-manipulation items-center justify-center gap-2 rounded-full border border-neutral-700 px-3 text-white transition hover:border-[#f359d2]/60 md:px-5"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          {open ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <Menu aria-hidden="true" className="size-5" />
          )}
          <span className="hidden text-sm font-bold md:inline">
            {isLoggedIn ? "Account" : "Menu"}
          </span>
        </button>
      </Container>

      {open ? (
        <div
          className="fixed inset-x-0 top-[4.5rem] z-[60] max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-neutral-800 bg-black/95 backdrop-blur-xl md:static md:z-auto md:max-h-none md:overflow-visible"
          id={menuId}
        >
          <Container className="flex flex-col gap-3 py-5 md:flex-row md:justify-end">
            {isLoggedIn ? (
              <>
                <ButtonLink
                  className="w-full md:w-auto"
                  href="/home"
                  onClick={() => setOpen(false)}
                  variant="secondary"
                >
                  <House aria-hidden="true" className="size-4" />
                  Home
                </ButtonLink>
                <ButtonLink
                  className="w-full md:w-auto"
                  href="/profile"
                  onClick={() => setOpen(false)}
                  variant="secondary"
                >
                  <CircleUserRound aria-hidden="true" className="size-4" />
                  My Profile
                </ButtonLink>

                <ButtonLink
                  className="w-full md:w-auto"
                  href="/home/notifications"
                  onClick={() => setOpen(false)}
                  variant="secondary"
                >
                  <Bell aria-hidden="true" className="size-4" />
                  Notifications
                </ButtonLink>
                <ButtonLink
                  className="w-full md:w-auto"
                  href="/home/discover"
                  onClick={() => setOpen(false)}
                  variant="secondary"
                >
                  <Compass aria-hidden="true" className="size-4" />
                  Explore Ecosystem
                </ButtonLink>

                <ButtonLink
                  className="w-full md:w-auto"
                  href="/account"
                  onClick={() => setOpen(false)}
                >
                  <Settings aria-hidden="true" className="size-4" />
                  Account
                </ButtonLink>
                <form action={signOutAction} className="w-full md:w-auto">
                  <button
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-neutral-700 px-6 py-3 text-sm font-bold text-white transition hover:border-[#f359d2]/60 hover:bg-white/5 md:w-auto"
                    type="submit"
                  >
                    <LogOut aria-hidden="true" className="size-4" />
                    Log Out
                  </button>
                </form>
              </>
            ) : (
              <ButtonLink
                className="w-full border-0 bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_36%,#f359d2_70%,#7cff00_100%)] text-white shadow-[0_0_20px_rgba(108,20,206,0.2)] hover:brightness-110 md:w-auto"
                href="/login"
                onClick={() => setOpen(false)}
              >
                Log In
              </ButtonLink>
            )}
          </Container>
        </div>
      ) : null}
    </header>
  );
}
