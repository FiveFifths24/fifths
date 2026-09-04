import type { Database } from "@/types/database";

export type FriendActivityItem =
  Database["public"]["Functions"]["get_friend_activity"]["Returns"][number];

const activityCopy: Record<
  FriendActivityItem["activity_type"],
  (title: string | null) => string
> = {
  session_created: (title) => `created the Session ${title ?? "a new Session"}`,
  session_joined: (title) => `joined the Session ${title ?? "a Session"}`,
  circle_created: (title) => `created the Circle ${title ?? "a new Circle"}`,
  circle_joined: (title) => `joined the Circle ${title ?? "a Circle"}`,
  profile_status_updated: () => "shared a new Current Signal",
  profile_music_updated: () => "updated their featured music",
  profile_featured_media_updated: () => "updated their featured profile media",
  profile_recommendation_updated: () => "shared a new recommendation",
  commons_created: (title) =>
    `posted the Commons opportunity ${title ?? "a new opportunity"}`,
};

export function activityDescription(item: FriendActivityItem) {
  return activityCopy[item.activity_type](item.entity_title);
}

export function relativeActivityTime(
  value: string,
  now: number = Date.now(),
): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Recently";
  const difference = Math.max(0, now - timestamp);
  const minutes = Math.floor(difference / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

export function nextActivityCursor(items: FriendActivityItem[]) {
  const last = items.at(-1);
  return last?.has_more ? { createdAt: last.created_at, id: last.id } : null;
}
