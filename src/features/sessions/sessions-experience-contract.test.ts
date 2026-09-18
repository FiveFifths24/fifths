import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(
  resolve(process.cwd(), "src/app/home/sessions/page.tsx"),
  "utf8",
);

describe("Sessions-first discovery experience", () => {
  it("keeps standard Sessions as the primary result area", () => {
    expect(page).toContain("<SessionResults");
    expect(page.indexOf("<SessionResults")).toBeGreaterThan(-1);
    expect(page.indexOf("<AroundEcosystem")).toBeGreaterThan(
      page.indexOf("<SessionResults"),
    );
  });

  it("keeps Session results independent from ecosystem previews", () => {
    expect(page).toContain("<SessionResults");
    expect(page).toContain("interests={interests}");
    expect(page).toContain("now={now.getTime()}");
    expect(page).toContain("sessions={sessionCards}");
    expect(page).toContain("<AroundEcosystem");
  });

  it("limits each ecosystem source before rendering", () => {
    expect(page).toContain("const campaignPreview = selectEcosystemPreview");
    expect(page).toContain("const circlePreview = selectEcosystemPreview");
    expect(page).toContain("const commonsPreview = selectEcosystemPreview");
  });

  it("keeps the page centered on mobile with desktop alignment restored", () => {
    expect(page).toContain('className="min-w-0 text-center sm:text-left"');
    expect(page).toContain("sm:justify-start sm:text-left");
  });
});
