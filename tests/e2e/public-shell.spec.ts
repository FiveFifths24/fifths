import { expect, test } from "@playwright/test";

test("landing page exposes the public shell and primary calls to action", async ({
  page,
}) => {
  const response = await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /find your space\.\s*match your energy/i,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeAttached();

  await expect(page.locator("#main-content")).toBeVisible();

  await expect(
    page.getByRole("link", { name: "Check Your Pulse" }).first(),
  ).toHaveAttribute("href", "/home/pulse");

  const headers = response?.headers() ?? {};

  expect(headers["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
});

test("header authentication control is usable at the active viewport", async ({
  page,
}) => {
  await page.goto("/about");

  const isMobile = (page.viewportSize()?.width ?? 0) < 768;

  if (isMobile) {
    const toggle = page.getByRole("button", {
      name: "Open navigation menu",
    });

    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();

    await expect(page.getByRole("link", { name: /log in/i })).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Close navigation menu" }),
    ).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");

    await expect(
      page.getByRole("button", { name: "Open navigation menu" }),
    ).toHaveAttribute("aria-expanded", "false");
  } else {
    await expect(page.locator("header")).toBeVisible();
  }
});

test("public and authentication pages fit the viewport", async ({ page }) => {
  for (const path of ["/", "/about", "/login", "/signup"]) {
    await page.goto(path);

    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );

    expect(horizontalOverflow, `${path} has horizontal overflow`).toBe(false);
  }
});

test("authentication interfaces remain accessible and honest", async ({
  page,
}) => {
  await page.goto("/login");

  const login = page.getByRole("form", { name: "Log in to FIFTHS" });

  await expect(login.getByLabel("Email address")).toHaveAttribute(
    "autocomplete",
    "email",
  );

  await expect(login.getByLabel("Password", { exact: true })).toHaveAttribute(
    "autocomplete",
    "current-password",
  );

  await expect(login.getByRole("button", { name: "Log in" })).toBeVisible();

  await page.goto("/signup");

  await expect(
    page.getByRole("checkbox", { name: /i confirm that i am 18 or older/i }),
  ).toHaveAttribute("required", "");

  await expect(
    page.getByRole("form", { name: "Create a FIFTHS account" }),
  ).toBeVisible();
});

test("legal and safety pages disclose their review status", async ({
  page,
}) => {
  for (const path of [
    "/privacy",
    "/terms",
    "/community-guidelines",
    "/commons/guidelines",
    "/realm/safety",
  ]) {
    await page.goto(path);

    await expect(page.getByText(/this is a phase 1 draft/i)).toBeVisible();

    await expect(
      page.getByText(/legal review is required before public launch/i).first(),
    ).toBeVisible();

    await expect(page.getByText(/18 and older/i).first()).toBeVisible();
  }
});
