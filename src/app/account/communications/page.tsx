import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LockKeyhole, Mail, Megaphone } from "lucide-react";
import { AccountTabs } from "@/components/account/account-tabs";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Container } from "@/components/ui/container";
import { StatusMessage } from "@/components/ui/status-message";
import {
  unsubscribeOptionalEmailAction,
  updateCommunicationPreferencesAction,
} from "@/features/communications/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Communication Preferences" };
export const dynamic = "force-dynamic";

type PreferenceProps = {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
};

function Preference({
  name,
  label,
  description,
  defaultChecked,
}: PreferenceProps) {
  return (
    <label className="flex min-h-28 cursor-pointer items-start gap-4 rounded-[1.25rem] border border-white/10 bg-black/25 p-4 text-left transition hover:border-[#f359d2]/35">
      <input
        className="mt-1 size-5 shrink-0 accent-[#f359d2]"
        defaultChecked={defaultChecked}
        name={name}
        type="checkbox"
      />
      <span>
        <span className="block text-sm font-black text-white">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-neutral-400">
          {description}
        </span>
      </span>
    </label>
  );
}

export default async function CommunicationPreferencesPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const parameters = await searchParams;
  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login?next=/account/communications");

  const { data: preferences, error } = await supabase
    .from("communication_preferences")
    .select("*")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error) return <AccountUnavailable />;

  const checked = (key: keyof NonNullable<typeof preferences>) =>
    Boolean(preferences?.[key]);

  return (
    <section className="min-h-screen bg-[#020205] py-12 text-white sm:py-16">
      <Container>
        <div className="mx-auto max-w-6xl text-center sm:text-left">
          <p className="flex items-center justify-center gap-2 text-xs font-black tracking-[0.2em] text-[#f359d2] uppercase sm:justify-start">
            <Mail aria-hidden="true" className="size-4" />
            Account settings
          </p>
          <h1 className="display-type mt-4 text-5xl leading-[0.95] sm:text-7xl">
            Communication Preferences
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-neutral-300 sm:mx-0">
            Choose which optional activity and Five Fifths emails you want.
            In-app notifications continue to work independently.
          </p>

          <AccountTabs active="communications" />

          {parameters?.saved === "success" ? (
            <StatusMessage className="mt-7" tone="success">
              Your communication preferences were saved.
            </StatusMessage>
          ) : null}
          {parameters?.saved === "unsubscribed" ? (
            <StatusMessage className="mt-7" tone="success">
              You are unsubscribed from all optional email.
            </StatusMessage>
          ) : null}
          {parameters?.saved === "error" ? (
            <StatusMessage className="mt-7" tone="error">
              Your preferences could not be saved. Please try again.
            </StatusMessage>
          ) : null}

          <section className="mt-8 rounded-[2rem] border border-[#ca9aff]/30 bg-[#0b0711] p-6 sm:p-8">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:text-left">
              <div className="flex size-10 items-center justify-center rounded-full border border-[#ca9aff]/35 bg-[#ca9aff]/10">
                <LockKeyhole
                  aria-hidden="true"
                  className="size-5 text-[#ca9aff]"
                />
              </div>
              <div>
                <p className="text-xs font-black tracking-[0.16em] text-[#ca9aff] uppercase">
                  Essential service messages
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  Account and safety email stays available
                </h2>
              </div>
            </div>
            <p className="mt-5 max-w-4xl text-sm leading-7 text-neutral-300">
              Password resets, authentication and security alerts, critical
              safety or moderation notices, material policy changes, and
              required account messages are not marketing preferences and cannot
              be disabled here.
            </p>
          </section>

          <form action={updateCommunicationPreferencesAction} className="mt-8">
            <fieldset className="rounded-[2rem] border border-white/10 bg-black/35 p-6 sm:p-8">
              <legend className="px-2 text-xl font-black text-white">
                SIGNAL activity email
              </legend>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                All activity categories default off. Turn on only the updates
                you want outside the private in-app inbox.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Preference
                  defaultChecked={checked("session_activity_email")}
                  description="Reminders and meaningful changes for Sessions you join or host."
                  label="Sessions"
                  name="sessionActivity"
                />
                <Preference
                  defaultChecked={checked("circle_activity_email")}
                  description="Circle invitations and important membership updates."
                  label="Circles"
                  name="circleActivity"
                />
                <Preference
                  defaultChecked={checked("commons_activity_email")}
                  description="Creator Commons response and collaboration updates."
                  label="Creator Commons"
                  name="commonsActivity"
                />
                <Preference
                  defaultChecked={checked("realm_activity_email")}
                  description="Campaign application and participation changes."
                  label="Fifth Realm"
                  name="realmActivity"
                />
                <Preference
                  defaultChecked={checked("passport_activity_email")}
                  description="Meaningful verified Passport record changes."
                  label="Passport"
                  name="passportActivity"
                />
                <Preference
                  defaultChecked={checked("social_activity_email")}
                  description="Friend, follow, and connection updates."
                  label="Social connections"
                  name="socialActivity"
                />
              </div>
            </fieldset>

            <fieldset className="mt-8 rounded-[2rem] border border-[#f359d2]/25 bg-[#10060d] p-6 sm:p-8">
              <legend className="px-2 text-xl font-black text-white">
                Five Fifths and marketing
              </legend>
              <p className="mt-2 text-sm leading-6 text-neutral-300">
                These are optional and require your explicit choice. Fundraising
                is always treated as optional marketing—not a service notice.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Preference
                  defaultChecked={checked("newsletter_email")}
                  description="Occasional SIGNAL and Five Fifths newsletter."
                  label="Newsletter"
                  name="newsletter"
                />
                <Preference
                  defaultChecked={checked("five_fifths_updates_email")}
                  description="Organization news and community impact updates."
                  label="Five Fifths updates"
                  name="fiveFifthsUpdates"
                />
                <Preference
                  defaultChecked={checked("ehub_updates_email")}
                  description="eHub programs, opportunities, and announcements."
                  label="eHub updates"
                  name="ehubUpdates"
                />
                <Preference
                  defaultChecked={checked("fundraising_email")}
                  description="Optional campaigns and ways to financially support the mission."
                  label="Fundraising"
                  name="fundraising"
                />
                <Preference
                  defaultChecked={checked("community_events_email")}
                  description="Community announcements and event promotions."
                  label="Community and events"
                  name="communityEvents"
                />
                <Preference
                  defaultChecked={checked("feature_announcements_email")}
                  description="New SIGNAL feature and product announcements."
                  label="Feature announcements"
                  name="featureAnnouncements"
                />
              </div>
            </fieldset>

            <div className="mt-7 flex justify-center sm:justify-start">
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#6c14ce,#f359d2)] px-7 py-3 text-sm font-black text-white shadow-[0_12px_35px_rgba(243,89,210,.2)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f359d2]"
                type="submit"
              >
                <Megaphone aria-hidden="true" className="size-4" />
                Save Preferences
              </button>
            </div>
          </form>

          <section className="mt-8 rounded-[2rem] border border-white/10 bg-black/35 p-6 text-center sm:p-8 sm:text-left">
            <h2 className="text-xl font-black text-white">
              Unsubscribe from optional email
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-400">
              You can unsubscribe from promotional emails at any time. We may
              still send essential service messages about your account,
              security, safety, or material changes to SIGNAL.
            </p>
            <form action={unsubscribeOptionalEmailAction} className="mt-5">
              <button
                className="min-h-12 rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white transition hover:border-[#f359d2]/45 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f359d2]"
                type="submit"
              >
                Unsubscribe From All Optional Email
              </button>
            </form>
          </section>
        </div>
      </Container>
    </section>
  );
}
