"use client";

import { useEffect, useRef } from "react";

import type { ActionState } from "@/features/auth/state";

export function FormErrorFocus({ state }: { state: ActionState }) {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (state.status !== "error") {
      return;
    }

    const marker = markerRef.current;
    const form = marker?.closest("form");

    if (!marker || !form) {
      return;
    }

    const firstInvalidField = Object.entries(state.fieldErrors ?? {}).find(
      ([, errors]) => errors?.length,
    )?.[0];

    if (firstInvalidField) {
      const escapedName = firstInvalidField.replaceAll('"', '\\"');

      const field = form.querySelector<HTMLElement>(`[name="${escapedName}"]`);

      if (field) {
        field.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        window.setTimeout(() => {
          field.focus({
            preventScroll: true,
          });
        }, 350);

        return;
      }
    }

    marker.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [state]);

  return <span ref={markerRef} aria-hidden="true" className="sr-only" />;
}
