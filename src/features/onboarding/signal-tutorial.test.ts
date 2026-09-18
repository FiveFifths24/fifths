import { describe, expect, it } from "vitest";
import { starterTasks, tutorialSteps } from "./signal-tutorial";

describe("SIGNAL tutorial content", () => {
  it("uses real routes for every required product area", () => {
    expect(tutorialSteps.map((step) => step.href)).toEqual([
      "/home",
      "/home/pulse",
      "/home/sessions",
      "/home/circles",
      "/home/commons",
      "/home/realm",
      "/home/passport",
      "/account",
      "/home/notifications",
      "/account/safety",
    ]);
  });

  it("keeps the Starter Path finite and distinct from verified credit", () => {
    expect(starterTasks).toHaveLength(8);
    expect(starterTasks.map((task) => task.key)).not.toContain(
      "passport_credit_awarded",
    );
    expect(new Set(starterTasks.map((task) => task.key)).size).toBe(
      starterTasks.length,
    );
  });
});
