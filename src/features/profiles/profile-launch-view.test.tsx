import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProfileLaunchView } from "./profile-launch-view";

const experience = {
  accentColor: "#ff3cac",
  mood: "Inspired",
  lastSeenAt: new Date().toISOString(),
  statusText: "Building something different.",
  statusExpiresAt: null,
  friendCount: 12,
  followerCount: 34,
  followingCount: 5,
  profileViewCount: 82,
  spotlightTitle: "Five Fifths eHub",
  spotlightDescription: "Currently building.",
  spotlightUrl: "https://example.com/focus",
  viewMyLabel: "Latest Video",
  viewMyUrl: "https://example.com/video",
  songTitle: "A Song",
  songArtist: "An Artist",
  songUrl: "https://youtube.com/watch?v=example",
  latestPickCategory: "Watching",
  latestPickTitle: "A great series",
  latestPickNote: "My current recommendation.",
  latestPickUrl: "https://example.com/latest",
  landscapeFit: "cover" as const,
  landscapePositionX: 50,
  landscapePositionY: 50,
  landscapeZoom: 100,
};

describe("ProfileLaunchView", () => {
  it("renders a personal profile hierarchy without Room terminology", () => {
    render(
      <ProfileLaunchView
        experience={experience}
        featuredConnections={[]}
        isOwner
        profile={{
          id: "00000000-0000-4000-8000-000000000001",
          username: "seven",
          displayName: "Seven",
          bio: "Founder and gamer.",
          createdAt: "2026-08-01T00:00:00Z",
          avatarUrl: null,
          landscapeUrl: null,
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Seven" })).toBeInTheDocument();
    expect(screen.getByText("Mood:")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "About Me" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Top Friends" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Profile Soundtrack" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Latest Video/ })).toHaveAttribute(
      "href",
      "https://example.com/video",
    );
    expect(screen.queryByText(/My Room/i)).not.toBeInTheDocument();
  });
});
