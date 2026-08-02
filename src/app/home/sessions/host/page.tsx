import type { Metadata } from "next";
import { CalendarPlus, ShieldAlert } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
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
  if (!userData.user) return <AccountUnavailable />;

  const [roleResult, profileResult, modeResult, interestResult, sessionResult] =
    await Promise.all([
      supabase.from("user_roles").select("role"),
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

  const roles = new Set((roleResult.data ?? []).map((item) => item.role));
  const canHost = roles.has("host") || roles.has("platform_admin");

  if (!canHost) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-red-400 uppercase">
          <ShieldAlert aria-hidden="true" className="size-4" /> Host access
        </p>
        <h1 className="display-type mt-4 text-5xl text-white sm:text-7xl">
          Hosting requires a trusted role.
        </h1>
        <StatusMessage className="mt-8">
          A platform administrator must assign the host role after an offline
          trust review. Members cannot elevate themselves, and Phase 4 does not
          add an administrator interface.
        </StatusMessage>
        <ButtonLink className="mt-7" href="/home/sessions">
          Explore Sessions
        </ButtonLink>
      </div>
    );
  }

  if (sessionResult.error) {
    return (
      <StatusMessage tone="error">
        Hosting is unavailable. Confirm that the Phase 4 migration has been
        applied to the connected Supabase project.
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
    <div>
      <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-red-400 uppercase">
        <CalendarPlus aria-hidden="true" className="size-4" /> Host tools
      </p>
      <h1 className="display-type mt-4 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl">
        Create with clear boundaries.
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
        Build a shared Session, review it as a draft, then publish it for member
        discovery. Capacity and attendance remain database-authorized.
      </p>

      <section
        className="mt-10 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-9"
        aria-labelledby="create-session-heading"
      >
        <h2
          className="text-3xl font-bold text-white"
          id="create-session-heading"
        >
          New Session draft
        </h2>
        <div className="mt-8">
          <CreateSessionForm
            defaultTimezone={profileResult.data?.timezone ?? "UTC"}
            interests={interestResult.data ?? []}
            modes={modeResult.data ?? []}
          />
        </div>
      </section>

      <section className="mt-12" aria-labelledby="hosted-sessions-heading">
        <h2
          className="text-3xl font-bold text-white"
          id="hosted-sessions-heading"
        >
          Your hosted Sessions
        </h2>
        {cards.length ? (
          <ul className="mt-6 grid gap-6 lg:grid-cols-2">
            {cards.map((card) => (
              <li className="space-y-3" key={card.id}>
                <SessionCard item={card} />
                <ButtonLink
                  className="w-full"
                  href={`/home/sessions/host/${card.id}`}
                  variant="secondary"
                >
                  Manage {card.title}
                </ButtonLink>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6">
            <PreviewState title="No hosted Sessions yet">
              Your first draft will appear here. Nothing is published until you
              explicitly review and publish it.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
