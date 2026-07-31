export const platformModules = [
  {
    slug: "pulse",
    name: "Pulse",
    purpose: "Daily capacity and transparent recommendations.",
  },
  {
    slug: "circles",
    name: "Circles",
    purpose: "Intentional communities and their shared activity.",
  },
  {
    slug: "commons",
    name: "Creator Commons",
    purpose: "Creator collaboration and opportunities.",
  },
  {
    slug: "realm",
    name: "Fifth Realm",
    purpose: "Campaign and immersive-story coordination.",
  },
  {
    slug: "passport",
    name: "Passport",
    purpose: "Verified contribution and participation history.",
  },
] as const;

export type PlatformModuleSlug = (typeof platformModules)[number]["slug"];
