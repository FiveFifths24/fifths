import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { sendDirectMessageAction } from "@/features/messages/actions";
import { signProfileMedia } from "@/features/profiles/profile-media";
import { ReportForm } from "@/features/trust-safety/report-form";

export default async function DirectConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("direct_conversations")
    .select("id, user_id_a, user_id_b, created_at, updated_at")
    .eq("id", conversationId)
    .maybeSingle();

  if (conversationError) {
    console.error("direct conversation query failed:", conversationError);
  }

  if (!conversation) {
    notFound();
  }

  const otherUserId =
    conversation.user_id_a === user.id
      ? conversation.user_id_b
      : conversation.user_id_a;

  const { data: memberProfiles, error: profileError } = await supabase.rpc(
    "get_member_profiles",
    {
      p_discoverable_only: false,
      p_username: null,
    },
  );

  if (profileError) {
    console.error("message profile lookup failed:", profileError);
  }

  const otherProfile = memberProfiles?.find(
    (profile) => profile.id === otherUserId,
  );
  const otherAvatarUrl = otherProfile
    ? await signProfileMedia(supabase, otherProfile.avatar_url)
    : null;

  const { data: messages, error: messagesError } = await supabase
    .from("direct_messages")
    .select(
      "id, conversation_id, sender_id, body, created_at, edited_at, deleted_at",
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("direct messages query failed:", messagesError);
  }

  const displayName =
    otherProfile?.display_name?.trim() ||
    otherProfile?.username ||
    "SIGNAL Member";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/55 shadow-[0_28px_90px_rgba(0,0,0,.38)] backdrop-blur-md">
        <header className="flex items-center gap-4 border-b border-white/10 px-5 py-5 sm:px-7">
          <Link
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white/65 transition hover:bg-white/[0.07] hover:text-white"
            href="/home/messages"
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
            <span className="sr-only">Back to messages</span>
          </Link>

          <Link
            className="flex min-w-0 items-center gap-3"
            href={
              otherProfile?.username
                ? `/home/profiles/${otherProfile.username}`
                : "/home/people"
            }
          >
            <div
              aria-label={`${displayName}'s profile photo`}
              className="size-11 shrink-0 rounded-full border-2 border-[#f359d2]/70 bg-gradient-to-br from-[#992bff] to-[#f359d2] bg-cover bg-center"
              role="img"
              style={
                otherAvatarUrl
                  ? {
                      backgroundImage: `url(${JSON.stringify(
                        otherAvatarUrl,
                      ).slice(1, -1)})`,
                    }
                  : undefined
              }
            />

            <div className="min-w-0">
              <p className="truncate font-black text-white">{displayName}</p>

              <p className="truncate text-xs text-white/40">
                {otherProfile?.username
                  ? `@${otherProfile.username}`
                  : "SIGNAL Member"}
              </p>
            </div>
          </Link>
        </header>

        <div className="flex min-h-[32rem] flex-col">
          <div className="flex-1 space-y-4 px-4 py-6 sm:px-7">
            {(messages ?? []).length ? (
              messages!.map((message) => {
                const isMine = message.sender_id === user.id;

                return (
                  <div
                    className={`flex ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                    key={message.id}
                  >
                    <div
                      className={
                        isMine
                          ? "max-w-[82%] rounded-[1.4rem] rounded-br-md bg-[linear-gradient(135deg,#992bff,#f359d2)] px-4 py-3 text-white shadow-[0_10px_30px_rgba(153,43,255,.16)] sm:max-w-[70%]"
                          : "max-w-[82%] rounded-[1.4rem] rounded-bl-md border border-white/10 bg-white/[0.055] px-4 py-3 text-white sm:max-w-[70%]"
                      }
                    >
                      <p className="text-sm leading-6 break-words whitespace-pre-wrap">
                        {message.deleted_at
                          ? "This message was deleted."
                          : message.body}
                      </p>

                      <p
                        className={`mt-1 text-[0.68rem] ${
                          isMine ? "text-white/65" : "text-white/30"
                        }`}
                      >
                        {new Intl.DateTimeFormat("en", {
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(new Date(message.created_at))}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex min-h-[26rem] items-center justify-center text-center">
                <div>
                  <p className="text-lg font-black text-white">
                    Start the conversation
                  </p>

                  <p className="mt-2 text-sm text-white/40">
                    Say hello to {displayName}.
                  </p>
                </div>
              </div>
            )}
          </div>

          <form
            action={sendDirectMessageAction}
            className="border-t border-white/10 bg-black/35 p-4 sm:p-5"
          >
            <input name="conversationId" type="hidden" value={conversationId} />

            <div className="flex items-end gap-3">
              <textarea
                className="max-h-40 min-h-12 flex-1 resize-y rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white transition outline-none placeholder:text-white/25 focus:border-[#f359d2]/55 focus:bg-white/[0.065]"
                maxLength={2000}
                name="body"
                placeholder={`Message ${displayName}...`}
                required
                rows={1}
              />

              <button
                className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#992bff,#f359d2)] text-white shadow-[0_10px_30px_rgba(153,43,255,.18)] transition hover:brightness-110"
                type="submit"
              >
                <Send aria-hidden="true" className="size-5" />
                <span className="sr-only">Send message</span>
              </button>
            </div>

            <p className="mt-2 text-xs text-white/25">
              Up to 2,000 characters.
            </p>
          </form>
        </div>
      </section>
      <details className="mt-6 rounded-[1.5rem] border border-red-300/15 bg-red-300/[0.03] p-5">
        <summary className="cursor-pointer font-bold text-red-100/70">
          Report This Conversation
        </summary>
        <p className="mt-3 text-sm leading-6 text-white/45">
          Include the relevant message text and time in your private report.
        </p>
        <div className="mt-6">
          <ReportForm
            defaultContextUrl={`/home/messages/${conversationId}`}
            defaultTarget="member"
            defaultTargetId={otherUserId}
            lockTarget
          />
        </div>
      </details>
    </main>
  );
}
