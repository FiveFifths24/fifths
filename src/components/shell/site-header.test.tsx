import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "./site-header";

const authState = vi.hoisted(() => ({ user: null as { id: string } | null }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: authState.user,
        },
        error: null,
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
  beforeEach(() => {
    authState.user = null;
  });

  it("shows the SIGNAL brand when signed out", () => {
    render(<SiteHeader />);
    expect(
      screen.getByRole("link", {
        name: "SIGNAL powered by FIVE FIFTHS",
      }),
    ).toHaveAttribute("href", "/");

    expect(
      screen.queryByRole("link", {
        name: "About",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", {
        name: "Community",
      }),
    ).not.toBeInTheDocument();
  });

  it("opens and closes the account menu accessibly", () => {
    render(<SiteHeader />);
    const openButton = screen.getByRole("button", {
      name: "Open navigation menu",
    });

    expect(openButton).toHaveAttribute("aria-expanded", "false");

    const menuId = openButton.getAttribute("aria-controls");

    expect(menuId).toBeTruthy();

    fireEvent.click(openButton);

    const mobileMenu = document.getElementById(menuId!);

    expect(mobileMenu).toBeInTheDocument();

    expect(
      within(mobileMenu!).getByRole("link", {
        name: "Log In",
      }),
    ).toHaveAttribute("href", "/login");

    const closeButton = screen.getByRole("button", {
      name: "Close navigation menu",
    });

    expect(closeButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(closeButton);

    expect(document.getElementById(menuId!)).not.toBeInTheDocument();
  });

  it("shows a persistent Log Out action in the signed-in menu", async () => {
    authState.user = { id: "00000000-0000-4000-8000-000000000001" };
    render(<SiteHeader />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Open navigation menu" }),
    );

    expect(
      await screen.findByRole("button", { name: "Log Out" }),
    ).toHaveAttribute("type", "submit");
  });
});
