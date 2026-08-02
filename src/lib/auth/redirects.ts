export function safeRedirectPath(
  candidate: string | null | undefined,
  fallback = "/account",
) {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(candidate, "https://fifths.invalid");
    if (parsed.origin !== "https://fifths.invalid") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
