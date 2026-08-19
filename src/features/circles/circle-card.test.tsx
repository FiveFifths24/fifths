import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CircleCard, type CircleCardItem } from "./circle-card";

const circle: CircleCardItem = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  name: "North Jersey Creator Circle",
  summary: "A community for creators building thoughtful work together.",
  status: "published",
  visibility: "public",
  join_policy: "request",
  format: "either",
  location_label: "Northern New Jersey and online",
  minimum_energy: 2,
  maximum_energy: 4,
  stimulation_level: "moderate",
  social_intensity: "light",
  modeName: "Create",
  interestNames: ["Creative technology"],
  reasons: ["Fits Your Current Mode", "Connects With Today's Interests"],
  membership: { role: "member", status: "requested" },
};

describe("CircleCard", () => {
  it("shows purpose, access, membership, and Pulse-fit context", () => {
    render(<CircleCard item={circle} />);
    expect(
      screen.getByRole("link", { name: "North Jersey Creator Circle" }),
    ).toHaveAttribute("href", `/home/circles/${circle.id}`);
    expect(screen.getByText("requested")).toBeInTheDocument();
    expect(screen.getByText("Fits Your Current Mode")).toBeInTheDocument();
  });

  it("communicates private visibility with text", () => {
    render(
      <CircleCard
        item={{ ...circle, visibility: "private", join_policy: "invite_only" }}
      />,
    );
    expect(screen.getByText("Private")).toBeInTheDocument();
  });
});
