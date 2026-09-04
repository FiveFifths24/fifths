import { StatusMessage } from "@/components/ui/status-message";
import {
  SESSION_PUBLISH_CAP_ERROR,
  type SessionStatusOutcome,
} from "./session-errors";

export function SessionStatusFeedback({
  status,
}: {
  status?: SessionStatusOutcome | string;
}) {
  if (status === "updated") {
    return (
      <StatusMessage className="mt-8 text-center sm:text-left" tone="success">
        Session status updated.
      </StatusMessage>
    );
  }

  if (status === "publishing-cap") {
    return (
      <StatusMessage className="mt-8 text-center sm:text-left" tone="error">
        {SESSION_PUBLISH_CAP_ERROR}
      </StatusMessage>
    );
  }

  if (status === "error") {
    return (
      <StatusMessage className="mt-8 text-center sm:text-left" tone="error">
        The status change could not be completed.
      </StatusMessage>
    );
  }

  return null;
}
