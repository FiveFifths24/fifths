import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({ usePathname: () => "/about" }));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: null,
        },
      }),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
    },
  }),
}));

describe("SiteHeader", () => {
  beforeEach(() => render(<SiteHeader />));

  it("provides labeled primary navigation and marks the active page", () => {
    const navigation = screen.getByRole("navigation", {
      name: "Primary navigation",
    });
    expect(
      within(navigation).getByRole("link", { name: "About" }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("opens and closes the mobile navigation with an accessible control", () => {
    const toggle = screen.getByRole("button", { name: "Open navigation menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(
      screen.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close navigation menu" }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});
