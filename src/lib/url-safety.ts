const privateIpv4 =
  /^(?:127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/;

export function normalizeSafeExternalUrl(value: string) {
  const input = value.trim();
  if (!input) return null;
  try {
    const url = new URL(input);
    const hostname = url.hostname.toLocaleLowerCase();
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      hostname === "localhost" ||
      hostname.endsWith(".local") ||
      hostname === "::1" ||
      privateIpv4.test(hostname)
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
