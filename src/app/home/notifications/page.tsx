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
function formatNotificationKind(kind: string) {
  return kind
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function formatNotificationTitle(title: string) {
  return title.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

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
            Your Updates, All In One Place
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
            Friend requests, activity, and important updates from across SIGNAL will appear here.
          </p>
        </div>
        {unread ? (
          <form action={markAllNotificationsReadAction}>
<button
  className="group flex min-h-12 items-center gap-2 rounded-full border border-[#f359d2]/35 bg-[linear-gradient(135deg,rgba(108,20,206,.18),rgba(243,89,210,.10))] px-6 text-sm font-bold text-white shadow-[0_10px_30px_rgba(108,20,206,.15)] transition hover:border-[#f359d2]/70 hover:bg-[linear-gradient(135deg,rgba(108,20,206,.28),rgba(243,89,210,.18))] hover:shadow-[0_12px_35px_rgba(243,89,210,.18)]"
  type="submit"
>
  <CheckCheck
    aria-hidden="true"
    className="size-4 text-[#f359d2] transition group-hover:text-white"
  />
  Mark All Read
</button>
          </form>
        ) : null}
      </div>
      {parameters?.read === "updated" || parameters?.read === "all" ? (
        <StatusMessage className="mt-7" tone="success">
          You're All Caught Up.
        </StatusMessage>
      ) : null}
      {parameters?.read === "error" ? (
        <StatusMessage className="mt-7" tone="error">
          Notification status could not be updated.
        </StatusMessage>
      ) : null}
<p className="mt-8 text-sm font-bold text-white/45">
  {unread === 1 ? "1 Unread" : `${unread} Unread`}
</p>
      {notifications.length ? (
        <ol className="mt-6 space-y-4">
          {notifications.map((item) => (
<li
  className={`rounded-[1.75rem] border p-5 shadow-[0_18px_50px_rgba(0,0,0,.25)] backdrop-blur-xl transition sm:p-6 ${
    item.read_at
      ? "border-white/10 bg-black/40"
      : "border-[#f359d2]/45 bg-[linear-gradient(135deg,rgba(108,20,206,.16),rgba(243,89,210,.08),rgba(0,0,0,.55))]"
  }`}
  key={item.id}
>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{formatNotificationKind(item.kind)}</Badge>
                    {!item.read_at ? (
<Badge className="border-[#8b5cf6]/45 bg-[#8b5cf6]/10 text-[#ddd0ff]">
  Unread
</Badge>
                    ) : null}
                  </div>
<h2 className="mt-3 text-xl font-black text-white sm:text-2xl">
  {formatNotificationTitle(item.title)}
</h2>

<p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
  {item.body}
</p>
                </div>
<div className="flex shrink-0 flex-wrap gap-3">
  {item.action_url ? (
    <ButtonLink
      href={item.action_url}
      className="border-0 bg-[linear-gradient(90deg,#6c14ce,#f359d2)] text-white shadow-[0_10px_30px_rgba(108,20,206,.25)] hover:brightness-110"
    >
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
        className="min-h-12 rounded-full border border-white/15 bg-black/30 px-5 text-sm font-bold text-white/70 transition hover:border-[#f359d2]/50 hover:text-white"
        type="submit"
      >
        Mark Read
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
            Nothing New Right Now.
          </PreviewState>
        </div>
      )}
    </div>
  );
}
