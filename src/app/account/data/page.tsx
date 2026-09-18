import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArchiveRestore, FileLock2, ShieldAlert, Trash2 } from "lucide-react";
import { AccountTabs } from "@/components/account/account-tabs";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Container } from "@/components/ui/container";
import { StatusMessage } from "@/components/ui/status-message";
import {
  cancelAccountDataRequestAction,
  requestAccountDataAction,
} from "@/features/account-data/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Account Data Controls" };
export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AccountDataPage({
  searchParams,
}: {
  searchParams?: Promise<{ request?: string; cancel?: string }>;
}) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const [{ data: userData }, parameters] = await Promise.all([
    supabase.auth.getUser(),
    searchParams,
  ]);
  if (!userData.user) redirect("/login?next=/account/data");

  const { data: requests, error } = await supabase
    .from("account_data_requests")
    .select("id, request_type, status, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(10);
  const activeRequest = (requests ?? []).find((request) =>
    ["submitted", "in_review"].includes(request.status),
  );

  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-5xl text-center sm:text-left">
        <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-[#ca9aff] uppercase sm:justify-start">
          <FileLock2 aria-hidden="true" className="size-4" />
          Account and Data
        </p>
        <h1 className="display-type mt-4 text-5xl text-white sm:text-7xl">
          Control what happens next.
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-neutral-300 sm:mx-0">
          Request account deactivation or deletion without silently destroying
          safety evidence, verified participation, or records needed to protect
          other members.
        </p>

        <AccountTabs active="data" />

        {parameters?.request === "submitted" ? (
          <StatusMessage className="mt-8" tone="success">
            Your account request was submitted. Your account remains active
            while the request is reviewed.
          </StatusMessage>
        ) : null}
        {parameters?.request === "error" || error ? (
          <StatusMessage className="mt-8" tone="error">
            Account data controls are temporarily unavailable. No account data
            was changed.
          </StatusMessage>
        ) : null}
        {parameters?.cancel === "cancelled" ? (
          <StatusMessage className="mt-8" tone="success">
            Your pending account request was cancelled.
          </StatusMessage>
        ) : null}

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-black/35 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <ShieldAlert aria-hidden="true" className="size-6 text-amber-300" />
            <h2 className="text-2xl font-bold text-white">
              What may be retained
            </h2>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/55">
            Ordinary profile information should be removed or de-identified
            where practical. Reports, moderation and security audit records,
            legal holds, fraud evidence, verified participation corrections, and
            records needed to protect other members may remain restricted. They
            are not exposed as public profile content. Final retention and
            identity-verification procedures require professional legal review.
          </p>
        </section>

        {activeRequest ? (
          <section className="mt-8 rounded-[2rem] border border-[#f359d2]/25 bg-[#f359d2]/[0.05] p-6 sm:p-8">
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <ArchiveRestore
                aria-hidden="true"
                className="size-6 text-[#f359d2]"
              />
              <h2 className="text-2xl font-bold text-white capitalize">
                {activeRequest.request_type} request {activeRequest.status}
              </h2>
            </div>
            <p className="mt-3 text-sm text-white/50">
              Submitted {formatDate(activeRequest.created_at)}. Submitting again
              will not create a duplicate request.
            </p>
            {activeRequest.status === "submitted" ? (
              <form action={cancelAccountDataRequestAction} className="mt-6">
                <input
                  name="requestId"
                  type="hidden"
                  value={activeRequest.id}
                />
                <button
                  className="min-h-12 rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:border-white/40"
                  type="submit"
                >
                  Cancel Pending Request
                </button>
              </form>
            ) : null}
          </section>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <RequestCard
              description="Ask Five Fifths to disable access and public visibility while preserving the account data required to process a later return or legal and safety obligations."
              icon={<ArchiveRestore aria-hidden="true" className="size-6" />}
              requestType="deactivation"
              title="Request Deactivation"
            />
            <RequestCard
              description="Ask Five Fifths to close the account and remove or de-identify ordinary account data where practical, subject to restricted safety, audit, and legal retention."
              icon={<Trash2 aria-hidden="true" className="size-6" />}
              requestType="deletion"
              title="Request Deletion"
            />
          </div>
        )}

        {(requests ?? []).length ? (
          <section className="mt-10" aria-labelledby="request-history">
            <h2 className="text-2xl font-bold text-white" id="request-history">
              Request History
            </h2>
            <ul className="mt-5 space-y-3">
              {(requests ?? []).map((request) => (
                <li
                  className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/55"
                  key={request.id}
                >
                  <span className="font-bold text-white capitalize">
                    {request.request_type}
                  </span>{" "}
                  · <span className="capitalize">{request.status}</span> ·{" "}
                  {formatDate(request.created_at)}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </Container>
  );
}

function RequestCard({
  title,
  description,
  requestType,
  icon,
}: {
  title: string;
  description: string;
  requestType: "deactivation" | "deletion";
  icon: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-[2rem] border border-white/10 bg-black/35 p-6 text-center sm:text-left">
      <div className="flex justify-center text-[#ca9aff] sm:justify-start">
        {icon}
      </div>
      <h2 className="mt-4 text-2xl font-bold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-7 break-words text-white/50">
        {description}
      </p>
      <form action={requestAccountDataAction} className="mt-6">
        <input name="requestType" type="hidden" value={requestType} />
        <label
          className="block text-sm font-bold text-white"
          htmlFor={`${requestType}-note`}
        >
          Optional note
        </label>
        <textarea
          className="mt-2 min-h-28 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#ca9aff]"
          id={`${requestType}-note`}
          maxLength={500}
          name="memberNote"
        />
        <button
          className="mt-4 min-h-12 w-full rounded-full border border-[#f359d2]/35 bg-[#f359d2]/10 px-6 py-3 font-bold text-white transition hover:border-[#f359d2]/60"
          type="submit"
        >
          {title}
        </button>
      </form>
    </section>
  );
}
