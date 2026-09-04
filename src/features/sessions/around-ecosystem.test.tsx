import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AroundEcosystem } from "./around-ecosystem";

const campaign = {
  href: "/home/realm/campaigns/campaign-1",
  title: "The Glass Archipelago",
  summary: "A recruiting campaign.",
  genre: "fantasy",
  format: "either",
  schedule: "Fridays",
  deadline: "2027-04-01T00:00:00.000Z",
  capacity: 6,
  activePlayers: 2,
  experienceLevel: "all_levels",
};

const circle = {
  href: "/home/circles/circle-1",
  name: "Local Makers",
  summary: "Build together in person.",
  format: "in_person",
  joinPolicy: "open",
};

const commons = {
  href: "/home/commons/opportunities/opportunity-1",
  title: "Album Cover Collaboration",
  summary: "An open creative brief.",
  creatorName: "Ari",
  kind: "collaboration",
  isPaid: true,
  format: "either",
  deadline: "2027-04-02T00:00:00.000Z",
  positions: 2,
  acceptedCount: 0,
};

describe("Around The Ecosystem", () => {
  it("renders at most one distinct preview and feature CTA per source", () => {
    render(
      <AroundEcosystem campaign={campaign} circle={circle} commons={commons} />,
    );

    expect(
      screen.getByRole("link", { name: /the glass archipelago/i }),
    ).toHaveAttribute("href", campaign.href);
    expect(screen.getByRole("link", { name: /local makers/i })).toHaveAttribute(
      "href",
      circle.href,
    );
    expect(
      screen.getByRole("link", { name: /album cover collaboration/i }),
    ).toHaveAttribute("href", commons.href);
    expect(
      screen.getByRole("link", { name: "Explore Fifth Realm" }),
    ).toHaveAttribute("href", "/home/realm");
    expect(
      screen.getByRole("link", { name: "See More Circles" }),
    ).toHaveAttribute("href", "/home/circles");
    expect(
      screen.getByRole("link", { name: "Explore Creator Commons" }),
    ).toHaveAttribute("href", "/home/commons");
  });

  it("keeps the section centered on mobile and restores desktop alignment", () => {
    const { container } = render(<AroundEcosystem campaign={campaign} />);
    expect(container.firstElementChild).toHaveClass(
      "text-center",
      "sm:text-left",
    );
  });

  it("does not render an empty discovery bridge", () => {
    const { container } = render(<AroundEcosystem />);
    expect(container).toBeEmptyDOMElement();
  });
});
