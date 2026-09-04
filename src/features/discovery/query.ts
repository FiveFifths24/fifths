export type DiscoveryScope = "across" | "near";
export type DiscoveryTiming = "all" | "soon";

export function parseDiscoveryQuery(
  input: string,
  explicitScope: DiscoveryScope,
  explicitTiming: DiscoveryTiming,
) {
  let query = input.trim().replace(/\s+/g, " ");
  let scope = explicitScope;
  let timing = explicitTiming;

  if (/\bnear me\b/i.test(query)) {
    scope = "near";
    query = query
      .replace(/\bnear me\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (/\b(this weekend|happening soon|soon)\b/i.test(query)) {
    timing = "soon";
    query = query
      .replace(/\b(this weekend|happening soon|soon)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return { query, scope, timing };
}

export function includesDiscoveryQuery(
  query: string,
  ...values: Array<string | null | undefined>
) {
  if (!query) return true;
  const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const haystack = values.filter(Boolean).join(" ").toLocaleLowerCase();
  return terms.every((term) => haystack.includes(term));
}
