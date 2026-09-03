export type OnboardingDraft = Array<readonly [string, string]>;

export function captureOnboardingDraft(form: HTMLFormElement): OnboardingDraft {
  return Array.from(new FormData(form).entries()).flatMap(([name, value]) =>
    typeof value === "string" ? ([[name, value]] as const) : [],
  );
}

export function restoreOnboardingDraft(
  form: HTMLFormElement,
  draft: OnboardingDraft,
) {
  const values = new Map<string, string[]>();

  for (const [name, value] of draft) {
    values.set(name, [...(values.get(name) ?? []), value]);
  }

  for (const element of Array.from(form.elements)) {
    if (
      !(
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement
      ) ||
      !element.name
    ) {
      continue;
    }

    const savedValues = values.get(element.name) ?? [];

    if (element instanceof HTMLInputElement) {
      if (element.type === "checkbox" || element.type === "radio") {
        element.checked = savedValues.includes(element.value);
      } else if (element.type !== "file") {
        element.value = savedValues[0] ?? "";
      }
      continue;
    }

    if (element instanceof HTMLSelectElement && element.multiple) {
      for (const option of Array.from(element.options)) {
        option.selected = savedValues.includes(option.value);
      }
      continue;
    }

    element.value = savedValues[0] ?? "";
  }
}
