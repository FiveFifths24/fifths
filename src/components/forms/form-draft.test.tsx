import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ActionState } from "@/features/auth/state";
import {
  ClearFormDraft,
  DraftRestoredNotice,
  useFormDraft,
} from "./form-draft";
import { formDraftStorageKey } from "./form-draft-config";

const storageKey = "signal:form-draft:v1:user:test";
const fields = ["title", "details", "format", "topics", "visibility"];

function DraftForm({ actionState }: { actionState?: ActionState }) {
  const { formRef, restored } = useFormDraft({
    storageKey,
    fields,
    actionState,
  });

  return (
    <form ref={formRef}>
      <DraftRestoredNotice restored={restored} />
      <label>
        Title
        <input name="title" />
      </label>
      <label>
        Details
        <textarea name="details" />
      </label>
      <label>
        Format
        <select name="format">
          <option value="">Choose</option>
          <option value="online">Online</option>
        </select>
      </label>
      <label>
        Games
        <input name="topics" type="checkbox" value="games" />
      </label>
      <label>
        Art
        <input name="topics" type="checkbox" value="art" />
      </label>
      <label>
        Public
        <input name="visibility" type="radio" value="public" />
      </label>
      <label>
        Private
        <input name="visibility" type="radio" value="private" />
      </label>
      <label>
        Password
        <input name="password" type="password" />
      </label>
    </form>
  );
}

describe("form draft persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it("isolates storage by member and form", () => {
    expect(formDraftStorageKey("session-create", "user-1")).not.toBe(
      formDraftStorageKey("circle-create", "user-1"),
    );
    expect(formDraftStorageKey("session-create", "user-1")).not.toBe(
      formDraftStorageKey("session-create", "user-2"),
    );
  });

  it("restores text, textarea, select, checkbox, and radio values", () => {
    const view = render(<DraftForm />);
    fireEvent.input(screen.getByLabelText("Title"), {
      target: { value: "Weekend campaign" },
    });
    fireEvent.input(screen.getByLabelText("Details"), {
      target: { value: "Bring a character idea." },
    });
    fireEvent.change(screen.getByLabelText("Format"), {
      target: { value: "online" },
    });
    fireEvent.click(screen.getByLabelText("Games"));
    fireEvent.click(screen.getByLabelText("Art"));
    fireEvent.click(screen.getByLabelText("Private"));
    fireEvent.input(screen.getByLabelText("Password"), {
      target: { value: "never-store-this" },
    });

    act(() => vi.advanceTimersByTime(200));
    view.unmount();
    render(<DraftForm />);
    act(() => vi.advanceTimersByTime(0));

    expect(screen.getByRole("status")).toHaveTextContent("Draft restored");
    expect(screen.getByLabelText("Title")).toHaveValue("Weekend campaign");
    expect(screen.getByLabelText("Details")).toHaveValue(
      "Bring a character idea.",
    );
    expect(screen.getByLabelText("Format")).toHaveValue("online");
    expect(screen.getByLabelText("Games")).toBeChecked();
    expect(screen.getByLabelText("Art")).toBeChecked();
    expect(screen.getByLabelText("Private")).toBeChecked();
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });

  it("prefers newer server-returned values and clears only on success", () => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        updatedAt: 1,
        values: { title: "Older local value" },
      }),
    );

    const view = render(
      <DraftForm
        actionState={{
          status: "error",
          fieldErrors: { details: ["Add more detail."] },
          values: { title: "Newer server value", details: "Too short" },
        }}
      />,
    );
    act(() => vi.advanceTimersByTime(0));

    expect(screen.getByLabelText("Title")).toHaveValue("Newer server value");
    expect(window.localStorage.getItem(storageKey)).not.toBeNull();

    view.rerender(<DraftForm actionState={{ status: "success" }} />);
    act(() => vi.advanceTimersByTime(0));
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it("clears a creation draft after the confirmed redirect destination loads", () => {
    window.localStorage.setItem(storageKey, "saved");
    render(<ClearFormDraft storageKey={storageKey} />);
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });
});
