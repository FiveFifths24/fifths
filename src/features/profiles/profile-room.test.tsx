import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProfileRoom } from "./profile-room";

const settings = {
  enabled: true,
  wallColor: "#241039",
  lightingTheme: "cosmic" as const,
  currentVibe: "creative" as const,
  characterColor: "#ff3cac",
  characterShape: "ghost" as const,
  characterExpression: "smile" as const,
  characterAccessory: "headphones" as const,
  motionEnabled: true,
};

function renderRoom() {
  return render(
    <ProfileRoom
      accentColor="#ff3cac"
      bio="Building the Fifth Signal."
      displayName="Seven"
      featuredConnections={[]}
      isOwner
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
  it("provides room and quick views with an owner edit path", () => {
    renderRoom();

    expect(
      screen.getByRole("heading", { name: "My Room" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Room View" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("link", { name: "Edit My Room" })).toHaveAttribute(
      "href",
      "/account#edit-my-room",
    );

    fireEvent.click(screen.getByRole("button", { name: "Quick View" }));
    expect(screen.getByText("Building the Fifth Signal.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quick View" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("opens an accessible room detail and closes it with Escape", () => {
    renderRoom();
    fireEvent.click(screen.getAllByRole("button", { name: /Bedroom/ })[0]!);
    expect(
      screen.getByRole("dialog", { name: "Bedroom details" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Coding from the couch.")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("dialog", { name: "Bedroom details" }),
    ).not.toBeInTheDocument();
  });
});
