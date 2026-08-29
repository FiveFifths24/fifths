import { describe, expect, it } from "vitest";
import {
  captureOnboardingDraft,
  restoreOnboardingDraft,
} from "./onboarding-draft";

describe("onboarding draft preservation", () => {
  it("restores text, selects, and every checkbox after a failed submission", () => {
    document.body.innerHTML = `
      <form>
        <input name="displayName" value="Seven" />
        <input name="username" value="invalid handle" />
        <select name="timezone"><option value="UTC">UTC</option><option selected value="America/New_York">Eastern</option></select>
        <input checked name="interestIds" type="checkbox" value="interest-1" />
        <input checked name="interestIds" type="checkbox" value="interest-2" />
        <input checked name="openToGaming" type="checkbox" />
        <textarea name="bio">Still here after an error.</textarea>
      </form>
    `;

    const form = document.querySelector("form")!;
    const draft = captureOnboardingDraft(form);

    form.reset();
    for (const input of Array.from(form.querySelectorAll("input"))) {
      if (input.type === "checkbox" || input.type === "radio") {
        input.checked = false;
      } else {
        input.value = "";
      }
    }
    form.querySelector("textarea")!.value = "";
    form.querySelector("select")!.value = "UTC";

    restoreOnboardingDraft(form, draft);

    expect(form.elements.namedItem("displayName")).toHaveValue("Seven");
    expect(form.elements.namedItem("username")).toHaveValue("invalid handle");
    expect(form.elements.namedItem("timezone")).toHaveValue("America/New_York");
    expect(form.elements.namedItem("bio")).toHaveValue(
      "Still here after an error.",
    );
    expect(
      form.querySelectorAll('input[name="interestIds"]:checked'),
    ).toHaveLength(2);
    expect(form.elements.namedItem("openToGaming")).toBeChecked();
  });
});
