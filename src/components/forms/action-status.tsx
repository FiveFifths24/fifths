import { StatusMessage } from "@/components/ui/status-message";
import type { ActionState } from "@/features/auth/state";

export function ActionStatus({ state }: { state: ActionState }) {
  if (!state.message || state.status === "idle") return null;
  return (
    <StatusMessage
      className="mb-5"
      tone={state.status === "success" ? "success" : "error"}
    >
      {state.message}
    </StatusMessage>
  );
}
