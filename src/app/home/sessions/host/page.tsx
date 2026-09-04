import type { Metadata } from "next";
import { CalendarPlus, Sparkles } from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { CreateSessionForm } from "@/features/sessions/create-session-form";
import { assembleSessionCards } from "@/features/sessions/session-data";
import { SessionCard } from "@/features/sessions/session-card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Host Sessions" };
export const dynamic = "force-dynamic";

export default async function HostSessionsPage() {
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

  const [profileResult, modeResult, interestResult, sessionResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("timezone")
        .eq("id", userData.user.id)
        .maybeSingle(),

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

      supabase
        .from("sessions")
        .select("*")
        .eq("host_user_id", userData.user.id)
        .order("starts_at", { ascending: false })
        .limit(30),
    ]);

  if (sessionResult.error) {
    return (
      <StatusMessage tone="error">
        Hosting is currently unavailable.
      </StatusMessage>
    );
  }

  const sessions = sessionResult.data ?? [];

  const links = sessions.length
    ? ((
        await supabase
          .from("session_interests")
          .select("session_id, interest_id")
          .in(
            "session_id",
            sessions.map((session) => session.id),
          )
      ).data ?? [])
    : [];

  const cards = assembleSessionCards(
    sessions,
    modeResult.data ?? [],
    interestResult.data ?? [],
    links,
  );

  return (
    <div className="text-center sm:text-left">
      {/* =====================================================
          PAGE INTRO
      ====================================================== */}
      <div className="mx-auto max-w-4xl sm:mx-0">
        <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-[#992bff] uppercase sm:justify-start">
          <CalendarPlus aria-hidden="true" className="size-4" />
          Host Sessions
        </p>

        <h1 className="display-type mt-4 text-5xl leading-[0.95] text-white sm:text-7xl">
          Bring People Together.
        </h1>

        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-neutral-300 sm:mx-0">
          Create a Session around something worth doing together. Shape the
          details, and publish it when you&apos;re ready.
        </p>
      </div>

      {/* =====================================================
          CREATE SESSION
      ====================================================== */}
      <section
        aria-labelledby="create-session-heading"
        className="mt-10 rounded-[2rem] border border-[#992bff]/20 bg-[#992bff]/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)] sm:p-9"
      >
        <div className="flex flex-col items-center sm:items-start">
          <CalendarPlus aria-hidden="true" className="size-6 text-[#992bff]" />

          <h2
            className="mt-4 text-3xl font-bold text-white"
            id="create-session-heading"
          >
            Create A New Session
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
            Add the details people need to understand what you&apos;re hosting
            and decide whether it&apos;s right for them.
          </p>
        </div>

        <div className="mt-8 text-left">
          <CreateSessionForm
            defaultTimezone={profileResult.data?.timezone ?? "UTC"}
            draftOwnerId={userData.user.id}
            interests={interestResult.data ?? []}
            modes={modeResult.data ?? []}
          />
        </div>
      </section>

      {/* =====================================================
          HOSTED SESSIONS
      ====================================================== */}
      <section className="mt-12" aria-labelledby="hosted-sessions-heading">
        <div className="flex items-center justify-center gap-3 sm:justify-start">
          <Sparkles aria-hidden="true" className="size-5 text-[#992bff]" />

          <h2
            className="text-3xl font-bold text-white"
            id="hosted-sessions-heading"
          >
            Your Hosted Sessions
          </h2>
        </div>

        {cards.length ? (
          <ul className="mt-6 grid gap-6 lg:grid-cols-2">
            {cards.map((card) => (
              <li className="space-y-3" key={card.id}>
                <SessionCard item={card} />

                <ButtonLink
                  className="w-full border-[#992bff]/35 bg-[#992bff]/10 text-white hover:border-[#992bff]/60 hover:bg-[#992bff]/15"
                  href={`/home/sessions/host/${card.id}`}
                  variant="secondary"
                >
                  Manage {card.title}
                </ButtonLink>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-[1.75rem] border border-[#992bff]/20 bg-[#992bff]/[0.035] px-6 py-10 text-center">
            <div className="mx-auto flex max-w-xl flex-col items-center">
              <CalendarPlus
                aria-hidden="true"
                className="size-6 text-[#992bff]"
              />

              <h3 className="mt-4 text-xl font-bold text-white">
                No Hosted Sessions Yet
              </h3>

              <p className="mt-3 max-w-md text-sm leading-6 text-white/50">
                Sessions you create will appear here.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
