type AzureCategory = "Hate" | "SelfHarm" | "Sexual" | "Violence";
type AzureSeverity = 0 | 2 | 4 | 6;

export type ContextualImageFixture = {
  name: string;
  rationale: string;
  categoriesAnalysis: Array<{
    category: AzureCategory;
    severity: AzureSeverity;
  }>;
  expected: "approved" | "review" | "rejected";
};

const safeCategories = (
  overrides: Partial<Record<AzureCategory, AzureSeverity>>,
) =>
  (["Hate", "SelfHarm", "Sexual", "Violence"] as const).map((category) => ({
    category,
    severity: overrides[category] ?? 0,
  }));

/** Synthetic provider responses: no prohibited source imagery is stored here. */
export const contextualImageFixtures: ContextualImageFixture[] = [
  {
    name: "swimwear and fashion photography",
    rationale: "Low sexual signals include fashion modeling and body art.",
    categoriesAnalysis: safeCategories({ Sexual: 2 }),
    expected: "approved",
  },
  {
    name: "cosplay with a prop weapon",
    rationale:
      "Displayed, pretend, and non-realistic weapons are legitimate context.",
    categoriesAnalysis: safeCategories({ Violence: 2 }),
    expected: "approved",
  },
  {
    name: "fantasy and video-game artwork",
    rationale: "Non-realistic fictional violence with low gore is allowed.",
    categoriesAnalysis: safeCategories({ Violence: 2 }),
    expected: "approved",
  },
  {
    name: "artistic figure work and tattoos",
    rationale: "Artistic nudity and body art are not explicit sexual activity.",
    categoriesAnalysis: safeCategories({ Sexual: 2 }),
    expected: "approved",
  },
  {
    name: "moderate fictional violence",
    rationale:
      "A broad medium violence signal cannot reliably establish real-world gore.",
    categoriesAnalysis: safeCategories({ Violence: 4 }),
    expected: "review",
  },
  {
    name: "ambiguous historical or extremist symbolism",
    rationale:
      "Azure does not return the context needed to distinguish history from propaganda.",
    categoriesAnalysis: safeCategories({ Hate: 6 }),
    expected: "review",
  },
  {
    name: "explicit sexual activity",
    rationale:
      "Azure's high sexual tier represents explicit or illegal sexual content.",
    categoriesAnalysis: safeCategories({ Sexual: 6 }),
    expected: "rejected",
  },
];
