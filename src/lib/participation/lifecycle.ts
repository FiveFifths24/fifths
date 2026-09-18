const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const PARTICIPATION_MAIN_GRACE_MS = DAY_MS;
export const PARTICIPATION_RECENT_WINDOW_MS = 7 * DAY_MS;

export type ParticipationLifecycle = "active" | "grace" | "recent" | "archive";

export function getParticipationLifecycle(
  endsAt: string,
  now: Date = new Date(),
): ParticipationLifecycle {
  const endTime = Date.parse(endsAt);

  if (!Number.isFinite(endTime)) {
    return "archive";
  }

  const elapsed = now.getTime() - endTime;

  if (elapsed <= 0) {
    return "active";
  }

  if (elapsed < PARTICIPATION_MAIN_GRACE_MS) {
    return "grace";
  }

  if (elapsed <= PARTICIPATION_RECENT_WINDOW_MS) {
    return "recent";
  }

  return "archive";
}

export function isMainDiscoveryLifecycle(lifecycle: ParticipationLifecycle) {
  return lifecycle === "active" || lifecycle === "grace";
}

export function isRecentlyEndedLifecycle(lifecycle: ParticipationLifecycle) {
  return lifecycle === "recent";
}
