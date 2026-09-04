"use client";

import { useEffect, useRef, useState } from "react";
import type { ActionState } from "@/features/auth/state";

type DraftValue = string | string[];

type StoredDraft = {
  version: 1;
  updatedAt: number;
  values: Record<string, DraftValue>;
};

type DraftControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const sensitiveName =
  /(password|passcode|otp|authentication.?code|credit.?card|card.?number|cvv|cvc|payment|private.?message|message.?body)/i;

function isDraftControl(value: Element): value is DraftControl {
  return (
    value instanceof HTMLInputElement ||
    value instanceof HTMLSelectElement ||
    value instanceof HTMLTextAreaElement
  );
}

function isSafeControl(control: DraftControl, allowedFields: Set<string>) {
  return (
    Boolean(control.name) &&
    allowedFields.has(control.name) &&
    control.dataset.draftSensitive !== "true" &&
    !sensitiveName.test(control.name) &&
    !(
      control instanceof HTMLInputElement &&
      ["file", "password", "hidden"].includes(control.type)
    )
  );
}

function controlsByName(form: HTMLFormElement, allowedFields: Set<string>) {
  const groups = new Map<string, DraftControl[]>();

  for (const element of form.querySelectorAll(
    "input[name], select[name], textarea[name]",
  )) {
    if (!isDraftControl(element) || !isSafeControl(element, allowedFields)) {
      continue;
    }
    const controls = groups.get(element.name) ?? [];
    controls.push(element);
    groups.set(element.name, controls);
  }

  return groups;
}

function readFormValues(form: HTMLFormElement, allowedFields: Set<string>) {
  const values: Record<string, DraftValue> = {};

  for (const [name, controls] of controlsByName(form, allowedFields)) {
    const first = controls[0];
    if (!first) continue;

    if (first instanceof HTMLInputElement && first.type === "checkbox") {
      values[name] = controls
        .filter(
          (control): control is HTMLInputElement =>
            control instanceof HTMLInputElement && control.checked,
        )
        .map((control) => control.value);
      continue;
    }

    if (first instanceof HTMLInputElement && first.type === "radio") {
      values[name] =
        controls.find(
          (control) => control instanceof HTMLInputElement && control.checked,
        )?.value ?? "";
      continue;
    }

    if (first instanceof HTMLSelectElement && first.multiple) {
      values[name] = Array.from(
        first.selectedOptions,
        (option) => option.value,
      );
      continue;
    }

    values[name] = first.value;
  }

  return values;
}

function setNativeValue(control: DraftControl, value: string) {
  const prototype = Object.getPrototypeOf(control) as object;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  setter?.call(control, value);
}

function setNativeChecked(control: HTMLInputElement, checked: boolean) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "checked",
  )?.set;
  setter?.call(control, checked);
}

function notifyControlChanged(control: DraftControl) {
  control.dispatchEvent(new Event("input", { bubbles: true }));
  control.dispatchEvent(new Event("change", { bubbles: true }));
}

function applyFormValues(
  form: HTMLFormElement,
  allowedFields: Set<string>,
  values: Record<string, DraftValue>,
) {
  for (const [name, controls] of controlsByName(form, allowedFields)) {
    if (!(name in values)) continue;
    const value = values[name];
    const selected = Array.isArray(value) ? value : [value];

    for (const control of controls) {
      if (
        control instanceof HTMLInputElement &&
        (control.type === "checkbox" || control.type === "radio")
      ) {
        setNativeChecked(control, selected.includes(control.value));
      } else if (control instanceof HTMLSelectElement && control.multiple) {
        for (const option of control.options) {
          option.selected = selected.includes(option.value);
        }
      } else if (typeof value === "string") {
        setNativeValue(control, value);
      }
      notifyControlChanged(control);
    }
  }
}

function readStoredDraft(storageKey: string): StoredDraft | null {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<StoredDraft>;
    if (
      parsed.version !== 1 ||
      !parsed.values ||
      typeof parsed.values !== "object"
    ) {
      window.localStorage.removeItem(storageKey);
      return null;
    }
    return parsed as StoredDraft;
  } catch {
    return null;
  }
}

function writeStoredDraft(
  storageKey: string,
  form: HTMLFormElement,
  allowedFields: Set<string>,
) {
  try {
    const draft: StoredDraft = {
      version: 1,
      updatedAt: Date.now(),
      values: readFormValues(form, allowedFields),
    };
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
  } catch {
    // Storage can be unavailable or full. The form remains fully usable.
  }
}

export function clearFormDraft(storageKey: string) {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Storage access is optional; successful form behavior must still continue.
  }
}

export function useFormDraft({
  storageKey,
  fields,
  actionState,
}: {
  storageKey: string;
  fields: readonly string[];
  actionState?: ActionState;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [restored, setRestored] = useState(false);
  const allowedFieldsRef = useRef(new Set(fields));
  const serverValues = actionState?.values;

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const draft = readStoredDraft(storageKey);
    if (!draft) return;

    applyFormValues(form, allowedFieldsRef.current, draft.values);
    const restoredTimer = window.setTimeout(() => setRestored(true), 0);
    return () => window.clearTimeout(restoredTimer);
  }, [storageKey]);

  useEffect(() => {
    const form = formRef.current;
    if (!form || !serverValues || Object.keys(serverValues).length === 0)
      return;

    // A server response is newer than a previously stored browser draft.
    applyFormValues(form, allowedFieldsRef.current, serverValues);
    writeStoredDraft(storageKey, form, allowedFieldsRef.current);
  }, [serverValues, storageKey]);

  useEffect(() => {
    if (actionState?.status !== "success") return;
    clearFormDraft(storageKey);
    const clearNoticeTimer = window.setTimeout(() => setRestored(false), 0);
    return () => window.clearTimeout(clearNoticeTimer);
  }, [actionState?.status, storageKey]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    let saveTimer: number | undefined;

    const save = () => {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(
        () => writeStoredDraft(storageKey, form, allowedFieldsRef.current),
        150,
      );
    };
    const flush = () => {
      window.clearTimeout(saveTimer);
      writeStoredDraft(storageKey, form, allowedFieldsRef.current);
    };

    form.addEventListener("input", save);
    form.addEventListener("change", save);
    form.addEventListener("submit", flush);
    window.addEventListener("pagehide", flush);

    return () => {
      window.clearTimeout(saveTimer);
      form.removeEventListener("input", save);
      form.removeEventListener("change", save);
      form.removeEventListener("submit", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, [storageKey]);

  return { formRef, restored };
}

export function DraftRestoredNotice({ restored }: { restored: boolean }) {
  if (!restored) return null;

  return (
    <p
      aria-live="polite"
      className="text-xs font-medium text-emerald-200/75"
      role="status"
    >
      Draft restored
    </p>
  );
}

export function ClearFormDraft({ storageKey }: { storageKey: string }) {
  useEffect(() => clearFormDraft(storageKey), [storageKey]);
  return null;
}
