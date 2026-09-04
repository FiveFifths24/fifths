import type { Metadata } from "next";
import { ArrowRight, MessagesSquare, Settings2 } from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { assembleCircleCards } from "@/features/circles/circle-data";
import { CircleCard } from "@/features/circles/circle-card";
import { CreateCircleForm } from "@/features/circles/create-circle-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Manage Circles",
};

export const dynamic = "force-dynamic";

export default async function ManageCirclesPage() {
  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return <AccountUnavailable />;
  }

  const [membershipResult, modeResult, interestResult] = await Promise.all([
    supabase
      .from("circle_members")
      .select("circle_id, role, status")
      .eq("user_id", userData.user.id)
      .eq("status", "active")
      .in("role", ["owner", "host", "moderator"]),

    supabase
      .from("modes")
      .select("id, name")
      .eq("active", true)
      .order("sort_order"),

    supabase
      .from("interests")
      .select("id, name")
      .eq("active", true)
      .order("name"),
  ]);

  const managedMemberships = membershipResult.data ?? [];

  const circlesResult = managedMemberships.length
    ? await supabase
        .from("circles")
        .select("*")
        .in(
          "id",
          managedMemberships.map((membership) => membership.circle_id),
        )
        .order("updated_at", { ascending: false })
    : { data: [], error: null };

  if (membershipResult.error || circlesResult.error) {
    return (
      <StatusMessage tone="error">
        Circle management is temporarily unavailable. Please try again shortly.
      </StatusMessage>
    );
  }

  const circles = circlesResult.data ?? [];

  const links = circles.length
    ? ((
        await supabase
          .from("circle_interests")
          .select("circle_id, interest_id")
          .in(
            "circle_id",
            circles.map((circle) => circle.id),
          )
      ).data ?? [])
    : [];

  const cards = assembleCircleCards(
    circles,
    modeResult.data ?? [],
    interestResult.data ?? [],
    links,
    [],
    managedMemberships,
  );

  return (
    <div className="text-center sm:text-left">
      {/* =====================================================
          PAGE INTRO
      ====================================================== */}
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
        <div className="max-w-4xl">
          <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-[#ee54a7] uppercase sm:justify-start">
            <MessagesSquare aria-hidden="true" className="size-4" />
            Circle Tools
          </p>

          <h1 className="display-type mt-4 text-5xl leading-[0.95] text-white sm:text-7xl">
            Build Community With Intention.
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
            Create and manage Circles with clear membership expectations,
            thoughtful boundaries, and the tools needed to support healthy
            community spaces.
          </p>
        </div>

        <ButtonLink
          className="min-h-12 min-w-[12.5rem] border-0 bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#ee54a7] px-7 text-sm whitespace-nowrap text-white shadow-lg shadow-[#6c14ce]/20 hover:brightness-110"
          href="/home/circles"
          variant="secondary"
        >
          <MessagesSquare
            aria-hidden="true"
            className="size-4 text-[#ee54a7]"
          />
          Discover Circles
        </ButtonLink>
      </div>

      {/* =====================================================
          CREATION ACCESS
      ====================================================== */}
      <section
        aria-labelledby="create-circle-heading"
        className="relative mt-12 overflow-hidden rounded-[2rem] border border-[#ee54a7]/20 bg-[#ee54a7]/[0.035] p-6 sm:p-9"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 -right-24 size-64 rounded-full bg-[#ee54a7]/[0.07] blur-[110px]"
        />

        <div className="relative">
          <div className="flex items-start gap-4">
            <div className="hidden size-11 shrink-0 items-center justify-center rounded-2xl border border-[#ee54a7]/25 bg-[#ee54a7]/10">
              <Settings2 aria-hidden="true" className="size-5 text-[#ee54a7]" />
            </div>

            <div>
              <h2
                className="text-3xl font-bold text-white"
                id="create-circle-heading"
              >
                Start A New Circle
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
                Create the foundation for a community, define how people can
                join, and shape the expectations members will see before they
                participate.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <CreateCircleForm
              draftOwnerId={userData.user.id}
              interests={interestResult.data ?? []}
              modes={modeResult.data ?? []}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          MANAGED CIRCLES
      ====================================================== */}
      <section className="mt-12" aria-labelledby="managed-circles-heading">
        <div className="flex items-center justify-center gap-3 sm:justify-start">
          <Settings2 aria-hidden="true" className="size-5 text-[#ee54a7]" />

          <h2
            className="text-2xl font-bold text-white"
            id="managed-circles-heading"
          >
            Circles You Manage
          </h2>
        </div>

        {cards.length ? (
          <ul className="mt-6 grid gap-6 lg:grid-cols-2">
            {cards.map((card) => (
              <li className="space-y-4" key={card.id}>
                <CircleCard item={card} />

                <ButtonLink
                  className="w-full border-[#ee54a7]/30 bg-black/40 text-white/85 hover:border-[#ee54a7]/60 hover:bg-[#ee54a7]/10 hover:text-white"
                  href={`/home/circles/manage/${card.id}`}
                  variant="secondary"
                >
                  Manage {card.name}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 text-[#ee54a7]"
                  />
                </ButtonLink>
              </li>
            ))}
          </ul>
        ) : (
          /* =================================================
              EMPTY STATE
          ================================================== */
          <div className="relative mt-6 overflow-hidden rounded-[2rem] border border-[#ee54a7]/20 bg-[#ee54a7]/[0.035] px-6 py-12 text-center sm:px-10 sm:py-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ee54a7]/[0.07] blur-[110px]"
            />

            <div className="relative mx-auto max-w-2xl">
              <h3 className="display-type text-3xl text-white sm:text-4xl">
                Your Managed Circles Will Appear Here.
              </h3>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
                When you create a Circle or receive an owner, host, or moderator
                role, you&apos;ll be able to return here to manage that
                community.
              </p>

              <div className="mt-8 flex justify-center">
                <ButtonLink
                  className="min-h-12 border-[#ee54a7]/35 bg-black/40 px-8 text-white/85 hover:border-[#ee54a7]/65 hover:bg-[#ee54a7]/10 hover:text-white"
                  href="/home/circles"
                >
                  Explore Circles
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 text-[#ee54a7]"
                  />
                </ButtonLink>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          MANAGEMENT NOTE
      ====================================================== */}
      <aside className="mt-10 flex gap-4 rounded-[1.5rem] border border-[#ee54a7]/15 bg-[#ee54a7]/[0.035] p-5 text-sm leading-7 text-white/55 sm:p-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#ee54a7]/25 bg-black/30">
          <MessagesSquare
            aria-hidden="true"
            className="size-5 text-[#ee54a7]"
          />
        </div>

        <div>
          <p className="font-bold text-white/80">
            Strong Communities Need Clear Stewardship.
          </p>

          <p className="mt-1">
            Circle management tools are scoped to the roles you hold, so
            community decisions stay connected to the people responsible for
            that space.
          </p>
        </div>
      </aside>
    </div>
  );
}
