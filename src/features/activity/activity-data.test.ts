import { describe, expect, it } from "vitest";
import {
  activityDescription,
  nextActivityCursor,
  relativeActivityTime,
  type FriendActivityItem,
} from "./activity-data";

const item: FriendActivityItem = {
  id: "event-1",
  actor_user_id: "user-1",
  actor_username: "maya",
  actor_display_name: "Maya",
  activity_type: "session_joined",
  entity_type: "session",
  entity_id: "session-1",
  entity_title: "Friday Night Overwatch",
  action_url: "/home/sessions/session-1",
  created_at: "2026-09-04T12:00:00.000Z",
  has_more: true,
};

describe("friend activity presentation", () => {
  it("describes canonical activity without copying private metadata", () => {
    expect(activityDescription(item)).toBe(
      "joined the Session Friday Night Overwatch",
    );
  });

  it("formats recent timestamps clearly", () => {
    expect(
      relativeActivityTime(item.created_at, Date.parse("2026-09-04T14:00:00Z")),
    ).toBe("2h ago");
  });

  it("only emits a pagination cursor when more personal activity exists", () => {
    expect(nextActivityCursor([item])).toEqual({
      createdAt: item.created_at,
      id: item.id,
    });
    expect(nextActivityCursor([{ ...item, has_more: false }])).toBeNull();
  });
});
