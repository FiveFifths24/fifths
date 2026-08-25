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

const primary =
  "min-h-11 rounded-full bg-[#992bff] px-5 py-2 text-sm font-bold text-white hover:bg-[#a855f7]";
const secondary =
  "min-h-11 rounded-full border border-white/15 px-5 py-2 text-sm font-bold text-white hover:border-[#ca9aff]/60";

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
  tone?: "primary" | "secondary" | "danger";
}) {
  return (
    <form action={action}>
      <input name="targetUserId" type="hidden" value={targetUserId} />
      <input name="returnTo" type="hidden" value={returnTo} />
      <button
        className={
          tone === "primary"
            ? primary
            : tone === "danger"
              ? `${secondary} border-red-800 text-red-200 hover:border-red-500`
              : secondary
        }
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
}: {
  targetUserId: string;
  returnTo: string;
  isFollowing: boolean;
  isMuted: boolean;
  friendship: "none" | "incoming" | "outgoing" | "friends";
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
      <ActionForm
        action={isFollowing ? unfollowProfileAction : followProfileAction}
        label={isFollowing ? "Following" : "Follow"}
        returnTo={returnTo}
        targetUserId={targetUserId}
        tone={isFollowing ? "secondary" : "primary"}
      />
      {friendship === "none" ? (
        <ActionForm
          action={sendFriendRequestAction}
          label="Add friend"
          returnTo={returnTo}
          targetUserId={targetUserId}
        />
      ) : null}
      {friendship === "incoming" ? (
        <ActionForm
          action={acceptFriendRequestAction}
          label="Accept friend request"
          returnTo={returnTo}
          targetUserId={targetUserId}
          tone="primary"
        />
      ) : null}
      {friendship === "outgoing" ? (
        <span className={`${secondary} inline-flex items-center text-white/50`}>
          Request sent
        </span>
      ) : null}
      {friendship === "friends" ? (
        <ActionForm
          action={removeFriendshipAction}
          label="Remove friend"
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
    </div>
  );
}
