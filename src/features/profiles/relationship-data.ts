import type { Database } from "@/types/database";

type Friendship = Database["public"]["Tables"]["profile_friendships"]["Row"];

export function otherFriendId(friendship: Friendship, userId: string) {
  return friendship.user_id_a === userId
    ? friendship.user_id_b
    : friendship.user_id_a;
}

export function friendshipState(
  friendship: Friendship | undefined,
  userId: string,
): "none" | "incoming" | "outgoing" | "friends" {
  if (!friendship) return "none";
  if (friendship.status === "accepted") return "friends";
  return friendship.requested_by === userId ? "outgoing" : "incoming";
}
