"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { initialActionState } from "@/features/auth/state";
import { updateFeaturedConnectionsAction } from "./actions";

export function FeaturedConnectionsForm({
  friends,
  selectedIds,
}: {
  friends: Array<{ id: string; username: string; displayName: string }>;
  selectedIds: string[];
}) {
  const [state, action] = useActionState(
    updateFeaturedConnectionsAction,
    initialActionState,
  );

  return (
    <form action={action} className="space-y-5">
      <ActionStatus state={state} />
      {friends.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {friends.map((friend) => (
            <label
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 has-checked:border-[#ca9aff]/70"
              key={friend.id}
            >
              <input
                className="size-5 accent-[#a855f7]"
                defaultChecked={selectedIds.includes(friend.id)}
                name="featuredUserIds"
                type="checkbox"
                value={friend.id}
              />
              <span>
                <span className="block font-bold text-white">
                  {friend.displayName}
                </span>
                <span className="block text-xs text-white/40">
                  @{friend.username}
                </span>
              </span>
            </label>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/40">
          Add friends before choosing featured connections.
        </p>
      )}
      <SubmitButton pendingLabel="Saving connections…">
        Save featured connections
      </SubmitButton>
    </form>
  );
}
