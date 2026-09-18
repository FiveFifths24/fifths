import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircle, UsersRound } from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { CircleChatForm } from "@/features/circles/circle-chat-form";
import { CircleChatRealtime } from "@/features/circles/circle-chat-realtime";
import { createClient } from "@/lib/supabase/server";
import { signProfileMedia } from "@/features/profiles/profile-media";
import {
  deleteCircleMessageAction,
  moderateCircleMessageAction,
} from "@/features/circles/actions";

export const metadata: Metadata = {
  title: "Circle Chat",
};

export const dynamic = "force-dynamic";

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function CircleChatPage({
  params,
}: {
  params: Promise<{ circleId: string }>;
}) {
  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const [{ circleId }, { data: userData }] = await Promise.all([
    params,
    supabase.auth.getUser(),
  ]);

  if (!userData.user) {
    return <AccountUnavailable />;
  }

  const [circleResult, membershipResult] = await Promise.all([
    supabase
      .from("circles")
      .select("id, name, summary, status")
      .eq("id", circleId)
      .maybeSingle(),

    supabase
      .from("circle_members")
      .select("role, status")
      .eq("circle_id", circleId)
      .eq("user_id", userData.user.id)
      .maybeSingle(),
  ]);

  if (circleResult.error) {
    return (
      <StatusMessage tone="error">
        Circle chat is temporarily unavailable.
      </StatusMessage>
    );
  }

  if (!circleResult.data) {
    notFound();
  }

  const circle = circleResult.data;
  const membership = membershipResult.data;

  if (!membership || membership.status !== "active") {
    notFound();
  }

  const messageResult = await supabase.rpc("get_circle_chat_messages", {
    p_circle_id: circle.id,
    p_limit: 100,
  });

  if (messageResult.error) {
    return (
      <StatusMessage tone="error">
        Messages could not be loaded right now.
      </StatusMessage>
    );
  }

  const messages = [...(messageResult.data ?? [])].reverse();

  const senderIds = Array.from(
    new Set(messages.map((message) => message.user_id)),
  );

  const profileResult = senderIds.length
    ? await supabase.rpc("get_member_profiles", {
        p_discoverable_only: false,
        p_username: null,
      })
    : { data: [], error: null };

  const visibleSenderProfiles = (profileResult.data ?? []).filter((profile) =>
    senderIds.includes(profile.id),
  );

  const profilesWithResolvedAvatars = await Promise.all(
    visibleSenderProfiles.map(async (profile) => ({
      ...profile,
      resolvedAvatarUrl: await signProfileMedia(supabase, profile.avatar_url),
    })),
  );

  const profileById = new Map(
    profilesWithResolvedAvatars.map((profile) => [profile.id, profile]),
  );

  const chatIsReadOnly = circle.status === "archived";

  return (
    <>
      <CircleChatRealtime circleId={circle.id} />
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          <ButtonLink href={`/home/circles/${circle.id}`} variant="quiet">
            ← Back To Circle
          </ButtonLink>
        </div>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-[#ee54a7]/20 bg-white/[0.025]">
          <header className="border-b border-white/[0.07] px-5 py-6 text-center sm:px-7 sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge>Circle Chat</Badge>

              <Badge className="border-[#ee54a7]/25 bg-[#ee54a7]/10 text-[#ff9ed1] capitalize">
                {membership.role}
              </Badge>

              {chatIsReadOnly ? (
                <Badge className="border-white/10 bg-white/[0.04] text-white/50">
                  Read Only
                </Badge>
              ) : null}
            </div>

            <div className="mt-5 flex items-center justify-center gap-3 sm:justify-start">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#ee54a7]/20 bg-[#ee54a7]/10">
                <MessageCircle
                  aria-hidden="true"
                  className="size-5 text-[#ff8bc9]"
                />
              </div>

              <div className="min-w-0 text-left">
                <h1 className="truncate text-xl font-bold text-white sm:text-2xl">
                  {circle.name}
                </h1>

                <p className="mt-1 text-sm text-white/45">
                  Talk with the people in this Circle.
                </p>
              </div>
            </div>
          </header>

          <div className="px-4 py-5 sm:px-7 sm:py-7">
            {messages.length ? (
              <div className="space-y-5">
                {messages.map((message) => {
                  const profile = profileById.get(message.user_id);

                  const displayName =
                    profile?.display_name?.trim() ||
                    profile?.username?.trim() ||
                    "SIGNAL Member";

                  const username = profile?.username?.trim() ?? null;
                  const isCurrentUser = message.user_id === userData.user.id;
                  const canModerateMessage =
                    membership.role === "owner" && !isCurrentUser;

                  return (
                    <article
                      className={[
                        "flex gap-3",
                        isCurrentUser ? "flex-row-reverse" : "flex-row",
                      ].join(" ")}
                      key={message.id}
                    >
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.06] sm:size-14">
                        {profile?.resolvedAvatarUrl ? (
                          <div
                            aria-label={`${displayName}'s profile photo`}
                            className="size-14 shrink-0 rounded-full border-2 bg-cover bg-center bg-no-repeat shadow-lg sm:size-16"
                            role="img"
                            style={{
                              borderColor: "#ee54a755",
                              backgroundImage: `url(${JSON.stringify(
                                profile.resolvedAvatarUrl,
                              ).slice(1, -1)})`,
                            }}
                          />
                        ) : (
                          <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] sm:size-16">
                            <UsersRound
                              aria-hidden="true"
                              className="size-5 text-white/45 sm:size-6"
                            />
                          </div>
                        )}
                      </div>

                      <div
                        className={[
                          "max-w-[85%] min-w-0",
                          isCurrentUser ? "text-right" : "text-left",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "flex flex-wrap items-baseline gap-x-2 gap-y-1",
                            isCurrentUser ? "justify-end" : "justify-start",
                          ].join(" ")}
                        >
                          <p className="text-sm font-bold text-white">
                            {isCurrentUser ? "You" : displayName}
                          </p>

                          {!isCurrentUser && username ? (
                            <span className="text-xs text-white/30">
                              @{username}
                            </span>
                          ) : null}

                          <time
                            className="text-xs text-white/30"
                            dateTime={message.created_at}
                          >
                            {formatMessageTime(message.created_at)}
                          </time>
                        </div>

                        <div
                          className={[
                            "mt-1.5 inline-block max-w-full rounded-2xl px-4 py-3 text-left text-sm leading-6 break-words",
                            isCurrentUser
                              ? "bg-[#ee54a7]/15 text-white"
                              : "border border-white/[0.07] bg-black/25 text-white/80",
                          ].join(" ")}
                        >
                          {message.deleted_at ? (
                            message.can_view_deleted_body && message.body ? (
                              <>
                                <p className="whitespace-pre-wrap text-white/85">
                                  {message.body}
                                </p>

                                <div className="mt-3">
                                  <span className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/[0.08] px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-amber-200/70 uppercase">
                                    {message.deletion_type === "moderation"
                                      ? "Removed by moderation"
                                      : "Deleted by sender"}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <p className="text-white/30 italic">
                                Message Deleted
                              </p>
                            )
                          ) : (
                            <p className="whitespace-pre-wrap text-white/90">
                              {message.body}
                            </p>
                          )}
                          <div
                            className={`mt-3 flex flex-wrap items-center gap-2 text-xs ${
                              isCurrentUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            {!message.deleted_at && isCurrentUser ? (
                              <form action={deleteCircleMessageAction}>
                                <input
                                  name="messageId"
                                  type="hidden"
                                  value={message.id}
                                />
                                <input
                                  name="circleId"
                                  type="hidden"
                                  value={circle.id}
                                />

                                <button
                                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-white/40 transition hover:border-red-400/25 hover:bg-red-500/10 hover:text-red-200"
                                  type="submit"
                                >
                                  Delete
                                </button>
                              </form>
                            ) : null}

                            {!message.deleted_at && canModerateMessage ? (
                              <form action={moderateCircleMessageAction}>
                                <input
                                  name="messageId"
                                  type="hidden"
                                  value={message.id}
                                />
                                <input
                                  name="circleId"
                                  type="hidden"
                                  value={circle.id}
                                />

                                <button
                                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-white/40 transition hover:border-red-400/25 hover:bg-red-500/10 hover:text-red-200"
                                  type="submit"
                                >
                                  Remove
                                </button>
                              </form>
                            ) : null}
                          </div>

                          {message.edited_at && !message.deleted_at ? (
                            <p className="mt-1 text-[0.65rem] text-white/30">
                              Edited
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#ee54a7]/20 bg-[#ee54a7]/[0.025] px-5 py-10 text-center">
                <MessageCircle
                  aria-hidden="true"
                  className="mx-auto size-6 text-[#ee54a7]"
                />

                <h2 className="mt-3 text-base font-bold text-white">
                  Start The Conversation
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
                  This Circle does not have any messages yet.
                </p>
              </div>
            )}
          </div>

          <footer className="border-t border-white/[0.07] bg-black/20 px-4 py-5 sm:px-7 sm:py-6">
            {chatIsReadOnly ? (
              <p
                className="text-center text-sm leading-6 text-white/45"
                role="status"
              >
                This Circle is archived. Its chat history is available, but new
                messages cannot be posted.
              </p>
            ) : (
              <CircleChatForm circleId={circle.id} />
            )}
          </footer>
        </section>
      </div>
    </>
  );
}
