import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: null,
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
    render(<SiteHeader />);
  });

  it("shows the SIGNAL brand and login action when signed out", () => {
    expect(
      screen.getByRole("link", {
        name: "SIGNAL powered by FIVE FIFTHS",
      }),
    ).toHaveAttribute("href", "/");

    expect(
      screen.getByRole("link", {
        name: "Log In",
      }),
    ).toHaveAttribute("href", "/login");

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

  it("opens and closes the mobile account menu accessibly", () => {
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
});