import { openDirectConversationAction } from "@/features/messages/actions";
import {
  acceptFriendRequestAction,
  blockProfileAction,
  followProfileAction,
  muteProfileAction,
  removeFriendshipAction,
  sendFriendRequestAction,
  unfollowProfileAction,
  unmuteProfileAction,
} from "./actions";
import { ShareProfileButton } from "./share-profile-button";

const secondary =
  "flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-3 text-center text-sm font-bold text-white/80 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white";

const danger =
  "flex min-h-11 w-full items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-center text-sm font-bold text-red-200 transition hover:border-red-500/40 hover:bg-red-500/15";

function ActionForm({
  action,
  label,
  targetUserId,
  returnTo,
  tone = "secondary",
}: {
  action: (formData: FormData) => void | Promise<void>;
  label: string;
  targetUserId: string;
  returnTo: string;
  tone?: "secondary" | "danger";
}) {
  return (
    <form action={action} className="w-full">
      <input name="targetUserId" type="hidden" value={targetUserId} />
      <input name="returnTo" type="hidden" value={returnTo} />

      <button
        className={tone === "danger" ? danger : secondary}
        type="submit"
      >
        {label}
      </button>
    </form>
  );
}

export function RelationshipControls({
  targetUserId,
  returnTo,
  isFollowing,
  isMuted,
  friendship,
  accentColor,
}: {
  targetUserId: string;
  returnTo: string;
  isFollowing: boolean;
  isMuted: boolean;
  friendship: "none" | "incoming" | "outgoing" | "friends";
  accentColor: string;
}) {
  return (
    <div
      className="rounded-[1.6rem] border p-3"
      style={{
        borderColor: `${accentColor}35`,
        background: `linear-gradient(145deg, ${accentColor}10 0%, rgba(0,0,0,.28) 42%, rgba(255,255,255,.025) 100%)`,
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <form action={openDirectConversationAction} className="w-full">
          <input name="targetUserId" type="hidden" value={targetUserId} />

      <button
        className="flex min-h-12 w-full items-center justify-center rounded-2xl border px-5 py-3 text-center text-sm font-bold text-white shadow-[0_10px_28px_rgba(0,0,0,.2)] transition hover:brightness-110"
        style={{
          borderColor: `${accentColor}99`,
          background: `linear-gradient(135deg, ${accentColor}50 0%, ${accentColor}d9 50%, ${accentColor}75 100%)`,
          boxShadow: `0 10px 28px ${accentColor}22`,
        }}
        type="submit"
      >
        Send Message
      </button>
    </form>

        {friendship === "none" ? (
          <ActionForm
            action={sendFriendRequestAction}
            label="Add Friend"
            returnTo={returnTo}
            targetUserId={targetUserId}
          />
        ) : null}

        {friendship === "incoming" ? (
          <ActionForm
            action={acceptFriendRequestAction}
            label="Accept Friend Request"
            returnTo={returnTo}
            targetUserId={targetUserId}
          />
        ) : null}

        {friendship === "outgoing" ? (
          <div className={`${secondary} cursor-default text-white`}>
            Request Sent
          </div>
        ) : null}

        {friendship === "friends" ? (
          <div className={`${secondary} cursor-default text-white`}>
            Friends
          </div>
        ) : null}

        <ActionForm
          action={isFollowing ? unfollowProfileAction : followProfileAction}
          label={isFollowing ? "Following" : "Follow"}
          returnTo={returnTo}
          targetUserId={targetUserId}
        />

        <ShareProfileButton path={returnTo} accentColor={""} />
      </div>

      <details className="group mt-3">
        <summary className="flex min-h-11 w-full cursor-pointer list-none items-center justify-center rounded-2xl border border-white/8 bg-black/25 px-5 py-3 text-sm font-bold text-white/35 transition hover:border-white/15 hover:bg-white/[0.03] hover:text-white/70">
          More Actions ···
        </summary>

        <div className="mt-3 grid gap-3 rounded-2xl border border-white/10 bg-black/45 p-3">
          {friendship === "friends" ? (
            <ActionForm
              action={removeFriendshipAction}
              label="Remove Friend"
              returnTo={returnTo}
              targetUserId={targetUserId}
            />
          ) : null}

          <ActionForm
            action={isMuted ? unmuteProfileAction : muteProfileAction}
            label={isMuted ? "Unmute" : "Mute"}
            returnTo={returnTo}
            targetUserId={targetUserId}
          />

          <ActionForm
            action={blockProfileAction}
            label="Block"
            returnTo={returnTo}
            targetUserId={targetUserId}
            tone="danger"
          />

          <a className={danger} href="#report-member">
            Report
          </a>
        </div>
      </details>
    </div>
  );
}