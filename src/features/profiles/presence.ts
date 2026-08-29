const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export function formatPresence(lastSeenAt: string | null, now = Date.now()) {
  if (!lastSeenAt) return "Away";
  const elapsed = Math.max(0, now - new Date(lastSeenAt).getTime());
  if (elapsed <= ONLINE_WINDOW_MS) return "Online Now";

  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 60) return `Active ${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Active ${hours}h ago`;
  if (hours < 48) return "Active yesterday";
  const days = Math.floor(hours / 24);
  if (days < 7) return `Active ${days}d ago`;
  return "Active recently";
}
