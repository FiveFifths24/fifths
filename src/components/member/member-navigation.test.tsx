import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemberNavigation } from "./member-navigation";

vi.mock("next/navigation", () => ({
  usePathname: () => "/home/sessions/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
}));

describe("MemberNavigation", () => {
  it("labels member routes and marks the active nested destination", () => {
    render(<MemberNavigation />);
    const navigation = screen.getByRole("navigation", {
      name: "Member navigation",
    });
    expect(
      within(navigation).getByRole("link", { name: "Sessions" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(navigation).getByRole("link", { name: "Home" }),
    ).not.toHaveAttribute("aria-current");
    expect(
      within(navigation).getByRole("link", { name: "Registrations" }),
    ).toHaveAttribute("href", "/home/registrations");
  });
});
