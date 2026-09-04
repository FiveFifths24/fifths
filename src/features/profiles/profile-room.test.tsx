import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ProfileRoom } from "./profile-room";

const settings = {
  enabled: true,
  wallColor: "#241039",
  lightingTheme: "cosmic" as const,
  currentVibe: "creative" as const,
  characterColor: "#ff3cac",
  headAccessory: "headphones" as const,
  faceAccessory: "glasses" as const,
  neckAccessory: "none" as const,
  motionEnabled: true,
};

function renderRoom() {
  return render(
    <ProfileRoom
      accentColor="#ff3cac"
      bio="Building the Fifth Signal."
      displayName="Seven"
      featuredConnections={[]}
      featuredProfileImageUrl={null}
      isOwner
      latestPick={{
        category: null,
        title: null,
        note: null,
        url: null,
      }}
      settings={settings}
      song={{
        title: "A Song",
        artist: "An Artist",
        url: "https://example.com",
      }}
      spotlight={{ title: "The eHub", description: "In progress", url: null }}
      statusText="Coding from the couch."
    />,
  );
}

describe("ProfileRoom", () => {
  beforeEach(() => window.localStorage.clear());

  it("provides the profile room with an owner edit path", () => {
    renderRoom();

    expect(
      screen.getByRole("heading", { name: "My Room" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit My Room" })).toHaveAttribute(
      "href",
      "/account#edit-my-room",
    );
    expect(screen.getByText("Profile Space")).toBeInTheDocument();
  });

  it("keeps legacy room content available while the launch profile is active", () => {
    renderRoom();
    expect(screen.getByText("Coding from the couch.")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Latest Pick" }),
    ).toBeInTheDocument();
  });

  it("lets each viewer override the automatic device-local house light", () => {
    renderRoom();
    fireEvent.change(screen.getByRole("combobox", { name: "Room light" }), {
      target: { value: "night" },
    });

    expect(window.localStorage.getItem("signal-room-theme")).toBe("night");
  });
});
