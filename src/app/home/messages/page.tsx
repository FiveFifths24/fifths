import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signProfileMedia } from "@/features/profiles/profile-media";

export default async function MessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: conversations, error: conversationsError } = await supabase
    .from("direct_conversations")
    .select("id, user_id_a, user_id_b, created_at, updated_at")
    .or(`user_id_a.eq.${user.id},user_id_b.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  if (conversationsError) {
    console.error("direct_conversations query failed:", conversationsError);
  }

  const conversationRows = conversations ?? [];

  const otherUserIds = conversationRows.map((conversation) =>
    conversation.user_id_a === user.id
      ? conversation.user_id_b
      : conversation.user_id_a,
  );

  const { data: memberProfiles, error: profilesError } = otherUserIds.length
    ? await supabase.rpc("get_member_profiles", {
        p_discoverable_only: false,
        p_username: null,
      })
    : { data: [], error: null };

  if (profilesError) {
    console.error("message profile lookup failed:", profilesError);
  }

  const relevantProfiles = (memberProfiles ?? []).filter((profile) =>
    otherUserIds.includes(profile.id),
  );

  const signedProfiles = await Promise.all(
    relevantProfiles.map(async (profile) => ({
      ...profile,
      avatarUrl: await signProfileMedia(supabase, profile.avatar_url),
    })),
  );

  const profileMap = new Map(
    signedProfiles.map((profile) => [profile.id, profile]),
  );

  const conversationIds = conversationRows.map(
    (conversation) => conversation.id,
  );

  const { data: messages, error: messagesError } = conversationIds.length
    ? await supabase
        .from("direct_messages")
        .select("id, conversation_id, sender_id, body, created_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  if (messagesError) {
    console.error("direct_messages query failed:", messagesError);
  }

  const latestMessageMap = new Map<
    string,
    {
      sender_id: string;
      body: string;
      created_at: string;
    }
  >();

  for (const message of messages ?? []) {
    if (!latestMessageMap.has(message.conversation_id)) {
      latestMessageMap.set(message.conversation_id, {
        sender_id: message.sender_id,
        body: message.body,
        created_at: message.created_at,
      });
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/55 shadow-[0_28px_90px_rgba(0,0,0,.38)] backdrop-blur-md">
        <div className="border-b border-white/10 px-6 py-7 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white/[0.05]">
              <MessageCircle
                aria-hidden="true"
                className="size-5 text-[#f359d2]"
              />
            </div>

            <div>
              <p className="text-xs font-black tracking-[0.22em] text-[#54b7ff] uppercase">
                SIGNAL
              </p>
              <h1 className="mt-1 text-3xl font-black text-white">Messages</h1>
            </div>
          </div>
        </div>

        {conversationRows.length ? (
          <div className="divide-y divide-white/10">
            {conversationRows.map((conversation) => {
              const otherUserId =
                conversation.user_id_a === user.id
                  ? conversation.user_id_b
                  : conversation.user_id_a;

              const profile = profileMap.get(otherUserId);
              const latestMessage = latestMessageMap.get(conversation.id);

              const displayName =
                profile?.display_name?.trim() ||
                profile?.username ||
                "SIGNAL Member";

              const username = profile?.username
                ? `@${profile.username}`
                : "Member";

              return (
                <Link
                  className="group flex items-center gap-4 px-6 py-5 transition hover:bg-white/[0.035] sm:px-8"
                  href={`/home/messages/${conversation.id}`}
                  key={conversation.id}
                >
                  <div
                    aria-label={`${displayName}'s profile photo`}
                    className="size-14 shrink-0 rounded-full border-2 border-[#f359d2]/70 bg-gradient-to-br from-[#992bff] to-[#f359d2] bg-cover bg-center"
                    role="img"
                    style={
                      profile?.avatarUrl
                        ? {
                            backgroundImage: `url(${JSON.stringify(
                              profile.avatarUrl,
                            ).slice(1, -1)})`,
                          }
                        : undefined
                    }
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-black text-white">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-white/40">
                          {username}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs text-white/30">
                        {new Intl.DateTimeFormat("en", {
                          month: "short",
                          day: "numeric",
                        }).format(
                          new Date(
                            latestMessage?.created_at ??
                              conversation.updated_at,
                          ),
                        )}
                      </span>
                    </div>

                    <p className="mt-2 truncate text-sm text-white/50">
                      {latestMessage
                        ? `${latestMessage.sender_id === user.id ? "You: " : ""}${
                            latestMessage.body
                          }`
                        : "Start the conversation."}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-20 text-center sm:px-8">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.035]">
              <MessageCircle
                aria-hidden="true"
                className="size-7 text-white/35"
              />
            </div>

            <h2 className="mt-5 text-xl font-black text-white">
              No messages yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
              Visit another member&apos;s profile and send them a message to
              start a conversation.
            </p>

            <Link
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#992bff] px-6 py-2 text-sm font-bold text-white transition hover:bg-[#a855f7]"
              href="/home/people"
            >
              Find People
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
