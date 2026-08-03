import type { Metadata } from "next";
import { Bell, CheckCheck } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/features/trust-safety/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ read?: string }>;
}) {
  const parameters = await searchParams;
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return <AccountUnavailable />;
  const result = await supabase
    .from("notifications")
    .select("id, kind, title, body, action_url, read_at, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (result.error)
    return (
      <StatusMessage tone="error">
        Notifications require the Phase 10 Supabase migration.
      </StatusMessage>
    );
  const notifications = result.data ?? [];
  const unread = notifications.filter((item) => !item.read_at).length;
  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-blue-300 uppercase">
            <Bell aria-hidden="true" className="size-4" /> Private inbox
          </p>
          <h1 className="display-type mt-4 text-5xl text-white sm:text-7xl">
            What changed for you.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
            In-app updates from FIFTHS workflows. Phase 10 does not send email,
            push, SMS, or marketing notifications.
          </p>
        </div>
        {unread ? (
          <form action={markAllNotificationsReadAction}>
            <button
              className="flex min-h-12 items-center gap-2 rounded-full border border-neutral-600 px-5 text-sm font-bold text-white hover:border-blue-400"
              type="submit"
            >
              <CheckCheck aria-hidden="true" className="size-4" /> Mark all read
            </button>
          </form>
        ) : null}
      </div>
      {parameters?.read === "updated" || parameters?.read === "all" ? (
        <StatusMessage className="mt-7" tone="success">
          Notification status updated.
        </StatusMessage>
      ) : null}
      {parameters?.read === "error" ? (
        <StatusMessage className="mt-7" tone="error">
          Notification status could not be updated.
        </StatusMessage>
      ) : null}
      <p className="mt-8 text-sm font-bold text-neutral-400">
        {unread} unread · newest 50 shown
      </p>
      {notifications.length ? (
        <ol className="mt-6 space-y-4">
          {notifications.map((item) => (
            <li
              className={`rounded-[1.5rem] border p-5 ${item.read_at ? "border-neutral-800 bg-neutral-950" : "border-blue-900 bg-blue-950/20"}`}
              key={item.id}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{item.kind.replaceAll("_", " ")}</Badge>
                    {!item.read_at ? (
                      <Badge className="border-blue-800 text-blue-100">
                        Unread
                      </Badge>
                    ) : null}
                  </div>
                  <h2 className="mt-3 text-xl font-bold text-white">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-400">
                    {item.body}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-3">
                  {item.action_url ? (
                    <ButtonLink href={item.action_url} variant="secondary">
                      Open
                    </ButtonLink>
                  ) : null}
                  {!item.read_at ? (
                    <form action={markNotificationReadAction}>
                      <input
                        name="notificationId"
                        type="hidden"
                        value={item.id}
                      />
                      <button
                        className="min-h-12 rounded-full border border-neutral-700 px-4 text-sm font-bold text-white hover:border-blue-400"
                        type="submit"
                      >
                        Mark read
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-7">
          <PreviewState title="No notifications">
            Workflow updates will appear here only when something relevant
            changes. No demonstration notification is created.
          </PreviewState>
        </div>
      )}
    </div>
  );
}
