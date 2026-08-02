import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CalendarRange,
  ClipboardCheck,
  LockKeyhole,
  Users,
} from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import {
  removeCampaignMemberAction,
  reviewCampaignApplicationAction,
  setCampaignSessionAction,
  setCampaignStatusAction,
} from "@/features/fifth-realm/actions";
import { formatCampaignDeadline } from "@/features/fifth-realm/campaign-card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Manage Fifth Realm campaign" };
export const dynamic = "force-dynamic";

function buttonClass(tone: "default" | "danger" = "default") {
  return `min-h-12 rounded-full border px-5 py-3 text-sm font-bold text-white ${tone === "danger" ? "border-red-800 bg-red-950 hover:border-red-600" : "border-neutral-600 bg-neutral-950 hover:border-indigo-500"}`;
}

export default async function ManageCampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ campaignId: string }>;
  searchParams?: Promise<{
    created?: string;
    status?: string;
    application?: string;
    member?: string;
    session?: string;
  }>;
}) {
  const [{ campaignId }, parameters] = await Promise.all([
    params,
    searchParams,
  ]);
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return <AccountUnavailable />;
  const [campaignResult, managerResult] = await Promise.all([
    supabase
      .from("realm_campaigns")
      .select("*")
      .eq("id", campaignId)
      .maybeSingle(),
    supabase.rpc("can_manage_realm_campaign", { p_campaign_id: campaignId }),
  ]);
  if (
    campaignResult.error ||
    !campaignResult.data ||
    managerResult.data !== true
  )
    notFound();
  const campaign = campaignResult.data;
  const [
    applicationResult,
    rosterResult,
    linkedSessionsResult,
    draftSessionsResult,
  ] = await Promise.all([
    supabase.rpc("get_realm_campaign_applications", {
      p_campaign_id: campaign.id,
    }),
    supabase.rpc("get_realm_campaign_roster", { p_campaign_id: campaign.id }),
    supabase
      .from("sessions")
      .select("id, title, status, starts_at, timezone, campaign_id, circle_id")
      .eq("campaign_id", campaign.id)
      .order("starts_at"),
    supabase
      .from("sessions")
      .select("id, title, status, starts_at, timezone, campaign_id, circle_id")
      .eq("status", "draft")
      .is("campaign_id", null)
      .order("starts_at"),
  ]);
  const compatibleDrafts = (draftSessionsResult.data ?? []).filter(
    (session) => session.circle_id === campaign.circle_id,
  );

  return (
    <div>
      <ButtonLink href="/home/realm/manage" variant="quiet">
        ← Back to GM workspace
      </ButtonLink>
      {parameters?.created === "1" ? (
        <StatusMessage className="mt-6" tone="success">
          Private draft created. Review every safety, access, and originality
          boundary before recruiting.
        </StatusMessage>
      ) : null}
      {parameters?.status === "updated" ? (
        <StatusMessage className="mt-6" tone="success">
          Campaign lifecycle updated.
        </StatusMessage>
      ) : null}
      {parameters?.status === "error" ? (
        <StatusMessage className="mt-6" tone="error">
          That lifecycle change was rejected. Check campaign status, deadline,
          and accepted players.
        </StatusMessage>
      ) : null}
      {parameters?.application === "accepted" ? (
        <StatusMessage className="mt-6" tone="success">
          The application was accepted and active membership created atomically.
        </StatusMessage>
      ) : null}
      {parameters?.application === "declined" ? (
        <StatusMessage className="mt-6">
          The application was declined.
        </StatusMessage>
      ) : null}
      {parameters?.application === "error" ? (
        <StatusMessage className="mt-6" tone="error">
          That application decision was rejected. Capacity or lifecycle may have
          changed.
        </StatusMessage>
      ) : null}
      {parameters?.member === "removed" ? (
        <StatusMessage className="mt-6" tone="success">
          The player was removed from the active roster.
        </StatusMessage>
      ) : null}
      {parameters?.member === "error" ? (
        <StatusMessage className="mt-6" tone="error">
          That roster change was rejected.
        </StatusMessage>
      ) : null}
      {parameters?.session === "associated" ? (
        <StatusMessage className="mt-6" tone="success">
          The draft Session is now associated with this campaign.
        </StatusMessage>
      ) : null}
      {parameters?.session === "removed" ? (
        <StatusMessage className="mt-6" tone="success">
          The Session association was removed.
        </StatusMessage>
      ) : null}
      {parameters?.session === "error" ? (
        <StatusMessage className="mt-6" tone="error">
          That Session association was rejected. Only compatible private drafts
          can change.
        </StatusMessage>
      ) : null}

      <div className="mt-8 rounded-[2rem] border border-indigo-950 bg-neutral-900 p-6 sm:p-9">
        <div className="flex flex-wrap gap-2">
          <Badge>{campaign.genre}</Badge>
          <Badge className="capitalize">{campaign.status}</Badge>
          <Badge>
            {campaign.active_player_count}/{campaign.player_capacity} players
          </Badge>
        </div>
        <h1 className="display-type mt-5 text-5xl leading-none text-white sm:text-7xl">
          {campaign.title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
          {campaign.summary}
        </p>
        <dl className="mt-7 grid gap-5 border-y border-neutral-800 py-6 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-neutral-500">Application deadline</dt>
            <dd className="mt-1 font-bold text-white">
              {formatCampaignDeadline(
                campaign.application_deadline,
                campaign.timezone,
              )}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Lifecycle</dt>
            <dd className="mt-1 font-bold text-white capitalize">
              {campaign.status}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Meetings</dt>
            <dd className="mt-1 font-bold text-white">Shared Realm Sessions</dd>
          </div>
        </dl>
        <div className="mt-7 flex flex-wrap gap-3">
          {campaign.status === "draft" ? (
            <form action={setCampaignStatusAction}>
              <input name="campaignId" type="hidden" value={campaign.id} />
              <input name="status" type="hidden" value="recruiting" />
              <button className={buttonClass()} type="submit">
                Open recruiting
              </button>
            </form>
          ) : null}
          {campaign.status === "recruiting" ? (
            <form action={setCampaignStatusAction}>
              <input name="campaignId" type="hidden" value={campaign.id} />
              <input name="status" type="hidden" value="active" />
              <button className={buttonClass()} type="submit">
                Start campaign
              </button>
            </form>
          ) : null}
          {campaign.status === "active" ? (
            <form action={setCampaignStatusAction}>
              <input name="campaignId" type="hidden" value={campaign.id} />
              <input name="status" type="hidden" value="completed" />
              <button className={buttonClass()} type="submit">
                Complete campaign
              </button>
            </form>
          ) : null}
          {(["draft", "recruiting", "active"] as const).includes(
            campaign.status as "draft" | "recruiting" | "active",
          ) ? (
            <form action={setCampaignStatusAction}>
              <input name="campaignId" type="hidden" value={campaign.id} />
              <input name="status" type="hidden" value="cancelled" />
              <button className={buttonClass("danger")} type="submit">
                Cancel campaign
              </button>
            </form>
          ) : null}
          <ButtonLink href={`/home/realm/${campaign.id}`} variant="secondary">
            View member page
          </ButtonLink>
        </div>
      </div>

      <StatusMessage className="mt-8">
        <span>
          <strong>Private review boundary:</strong> motivation and availability
          are visible only to authorized campaign managers and each applicant.
          Do not copy them into public campaign content.
        </span>
      </StatusMessage>

      <section className="mt-10" aria-labelledby="application-queue-heading">
        <div className="flex items-center gap-3">
          <ClipboardCheck
            aria-hidden="true"
            className="size-5 text-indigo-300"
          />
          <h2
            className="text-2xl font-bold text-white"
            id="application-queue-heading"
          >
            Private application queue
          </h2>
        </div>
        {applicationResult.error ? (
          <StatusMessage className="mt-6" tone="error">
            The private application queue could not load.
          </StatusMessage>
        ) : (applicationResult.data ?? []).length ? (
          <div className="mt-6 space-y-5">
            {(applicationResult.data ?? []).map((application) => (
              <article
                className="rounded-[1.75rem] border border-neutral-800 bg-neutral-900 p-6"
                key={application.user_id}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="capitalize">
                        {application.application_status}
                      </Badge>
                      <Badge className="capitalize">
                        {application.experience_level}
                      </Badge>
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-white">
                      {application.display_name}
                    </h3>
                    {application.username ? (
                      <p className="mt-1 text-sm text-neutral-500">
                        @{application.username}
                      </p>
                    ) : null}
                    <h4 className="mt-5 text-xs font-bold tracking-wide text-indigo-200 uppercase">
                      Motivation
                    </h4>
                    <p className="mt-2 text-sm leading-6 whitespace-pre-line text-neutral-300">
                      {application.motivation}
                    </p>
                    <h4 className="mt-5 text-xs font-bold tracking-wide text-indigo-200 uppercase">
                      Availability
                    </h4>
                    <p className="mt-2 text-sm leading-6 whitespace-pre-line text-neutral-300">
                      {application.availability}
                    </p>
                  </div>
                  {application.application_status === "submitted" &&
                  campaign.status === "recruiting" ? (
                    <div className="flex shrink-0 flex-wrap gap-3">
                      <form action={reviewCampaignApplicationAction}>
                        <input
                          name="campaignId"
                          type="hidden"
                          value={campaign.id}
                        />
                        <input
                          name="userId"
                          type="hidden"
                          value={application.user_id}
                        />
                        <input name="decision" type="hidden" value="accept" />
                        <button className={buttonClass()} type="submit">
                          Accept
                        </button>
                      </form>
                      <form action={reviewCampaignApplicationAction}>
                        <input
                          name="campaignId"
                          type="hidden"
                          value={campaign.id}
                        />
                        <input
                          name="userId"
                          type="hidden"
                          value={application.user_id}
                        />
                        <input name="decision" type="hidden" value="decline" />
                        <button className={buttonClass("danger")} type="submit">
                          Decline
                        </button>
                      </form>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <PreviewState title="No applications yet">
              Recruiting campaigns will show private member applications here.
              No demonstration applicants are created.
            </PreviewState>
          </div>
        )}
      </section>

      <section className="mt-10" aria-labelledby="campaign-roster-heading">
        <div className="flex items-center gap-3">
          <Users aria-hidden="true" className="size-5 text-indigo-300" />
          <h2
            className="text-2xl font-bold text-white"
            id="campaign-roster-heading"
          >
            Active roster
          </h2>
        </div>
        {rosterResult.error ? (
          <StatusMessage className="mt-6" tone="error">
            The private roster could not load.
          </StatusMessage>
        ) : (rosterResult.data ?? []).length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(rosterResult.data ?? []).map((member) => (
              <article
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
                key={member.user_id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge className="capitalize">
                      {member.member_role.replaceAll("_", " ")}
                    </Badge>
                    <h3 className="mt-3 font-bold text-white">
                      {member.display_name}
                    </h3>
                    {member.username ? (
                      <p className="mt-1 text-sm text-neutral-500">
                        @{member.username}
                      </p>
                    ) : null}
                  </div>
                  {member.member_role === "player" &&
                  campaign.status !== "completed" ? (
                    <form action={removeCampaignMemberAction}>
                      <input
                        name="campaignId"
                        type="hidden"
                        value={campaign.id}
                      />
                      <input
                        name="userId"
                        type="hidden"
                        value={member.user_id}
                      />
                      <button className={buttonClass("danger")} type="submit">
                        Remove
                      </button>
                    </form>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <PreviewState title="No active roster">
              The game master is added on draft creation; accepted applicants
              become players atomically.
            </PreviewState>
          </div>
        )}
      </section>

      <section className="mt-10" aria-labelledby="campaign-sessions-heading">
        <div className="flex items-center gap-3">
          <CalendarRange
            aria-hidden="true"
            className="size-5 text-indigo-300"
          />
          <h2
            className="text-2xl font-bold text-white"
            id="campaign-sessions-heading"
          >
            Shared Session associations
          </h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
          Only private draft Sessions with the same Circle boundary can be
          associated. Published Realm Sessions are visible to active campaign
          members.
        </p>
        {(linkedSessionsResult.data ?? []).length ? (
          <div className="mt-6 space-y-3">
            {(linkedSessionsResult.data ?? []).map((session) => (
              <article
                className="flex flex-col gap-4 rounded-2xl border border-indigo-950 bg-neutral-900 p-5 sm:flex-row sm:items-center sm:justify-between"
                key={session.id}
              >
                <div>
                  <Badge className="capitalize">{session.status}</Badge>
                  <h3 className="mt-3 font-bold text-white">{session.title}</h3>
                </div>
                {session.status === "draft" ? (
                  <form action={setCampaignSessionAction}>
                    <input
                      name="campaignId"
                      type="hidden"
                      value={campaign.id}
                    />
                    <input name="sessionId" type="hidden" value={session.id} />
                    <input name="associate" type="hidden" value="false" />
                    <button className={buttonClass()} type="submit">
                      Remove association
                    </button>
                  </form>
                ) : (
                  <ButtonLink
                    href={`/home/sessions/${session.id}`}
                    variant="secondary"
                  >
                    View Session
                  </ButtonLink>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <PreviewState title="No linked Sessions">
              Create an appropriate draft in the Session host workspace, then
              associate it below.
            </PreviewState>
          </div>
        )}
        {compatibleDrafts.length ? (
          <div className="mt-7">
            <h3 className="font-bold text-white">Compatible private drafts</h3>
            <div className="mt-4 space-y-3">
              {compatibleDrafts.map((session) => (
                <article
                  className="flex flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 sm:flex-row sm:items-center sm:justify-between"
                  key={session.id}
                >
                  <p className="font-bold text-white">{session.title}</p>
                  <form action={setCampaignSessionAction}>
                    <input
                      name="campaignId"
                      type="hidden"
                      value={campaign.id}
                    />
                    <input name="sessionId" type="hidden" value={session.id} />
                    <input name="associate" type="hidden" value="true" />
                    <button className={buttonClass()} type="submit">
                      Associate Session
                    </button>
                  </form>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-10 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <LockKeyhole aria-hidden="true" className="size-5 text-indigo-300" />
          <h2 className="mt-4 font-bold text-white">Private applications</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Application content is never public discovery data.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <ClipboardCheck
            aria-hidden="true"
            className="size-5 text-indigo-300"
          />
          <h2 className="mt-4 font-bold text-white">Capacity locked</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Acceptance locks the campaign before counting authoritative seats.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <CalendarRange
            aria-hidden="true"
            className="size-5 text-indigo-300"
          />
          <h2 className="mt-4 font-bold text-white">Shared Sessions</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Meetings reuse the platform Session lifecycle; no VTT is embedded.
          </p>
        </div>
      </section>
    </div>
  );
}
