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
import type { ReactNode } from "react";

const secondary =
  "flex min-h-11 w-full items-center justify-center rounded-full border border-white/10 bg-black/45 px-5 py-2.5 text-center text-sm font-bold text-white/80 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white md:w-auto";

const danger =
  "flex min-h-11 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 px-6 py-2.5 text-center text-sm font-bold text-red-200 transition hover:border-red-500/40 hover:bg-red-500/15";

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
    <form action={action} className="w-full md:w-auto">
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
  reportSection,
}: {
    targetUserId: string;
  returnTo: string;
  isFollowing: boolean;
  isMuted: boolean;
  friendship: "none" | "incoming" | "outgoing" | "friends";
  accentColor: string;
  reportSection?: ReactNode;
}) {
return (
  <div className="w-full">
    <div className="grid w-full grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center md:justify-center">
              <form action={openDirectConversationAction} className="w-full md:w-auto">
          <input name="targetUserId" type="hidden" value={targetUserId} />

      <button
        className="flex min-h-11 w-full items-center justify-center rounded-full border px-6 py-2.5 text-center text-sm font-bold text-white shadow-[0_10px_28px_rgba(0,0,0,.2)] transition hover:brightness-110 md:w-auto"
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

<details 
className="group relative mt-4 w-full">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-2xl border border-white/8 bg-black/25 px-5 py-3 text-sm font-bold text-white transition hover:border-white/15 hover:bg-white/[0.03] hover:text-white/70">
          More Actions ···
        </summary>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-white/10 bg-black/45 p-4">
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

{reportSection ? (
  <div className="mt-1">
    {reportSection}
  </div>
) : null}
        </div>
      </details>
    </div>
  );
}