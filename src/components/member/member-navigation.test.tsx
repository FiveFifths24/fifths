import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemberNavigation } from "./member-navigation";

vi.mock("next/navigation", () => ({
  usePathname: () => "/home/pulse/history",
}));

describe("MemberNavigation", () => {
  it("labels member routes and marks the exact active destination", () => {
    render(<MemberNavigation />);
    const navigation = screen.getByRole("navigation", {
      name: "Member navigation",
    });
    expect(
      within(navigation).getByRole("link", { name: "History" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(navigation).getByRole("link", { name: "Check Pulse" }),
    ).not.toHaveAttribute("aria-current");
  });
});
