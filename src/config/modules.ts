import {
  Aperture,
  BadgeCheck,
  Gamepad2,
  HeartHandshake,
  Radio,
  type LucideIcon,
} from "lucide-react";

export type PlatformModule = {
  slug: "pulse" | "circles" | "commons" | "realm" | "passport";
  name: string;
  eyebrow: string;
  purpose: string;
  summary: string;
  audience: string[];
  capabilities: string[];
  mvpIncludes: string[];
  notIncluded: string[];
  pulseConnection: string;
  passportConnection: string;
  icon: LucideIcon;
  accent: string;
  glow: string;
};

export const platformModules: PlatformModule[] = [
  {
    slug: "pulse",
    name: "Pulse",
    eyebrow: "Start with your capacity",
    purpose: "Daily capacity and transparent recommendations.",
    summary:
      "Pulse will help you name the kind of participation you have room for today, then surface experiences that fit your energy instead of competing for it.",
    audience: [
      "People balancing changing energy",
      "Intentional participants",
      "Anyone who wants less noise",
    ],
    capabilities: [
      "Choose Play, Create, Connect, Focus, or Reset",
      "Set stimulation and social preferences",
      "Receive clear, explainable recommendations",
    ],
    mvpIncludes: [
      "Daily check-in",
      "Five participation modes",
      "Preference-aware recommendations",
      "Visible match explanations",
    ],
    notIncluded: [
      "Medical or diagnostic data",
      "AI decision-making",
      "Hidden behavioral scoring",
    ],
    pulseConnection:
      "Pulse is the starting point. Its latest valid check-in will guide recommendations across every other FIFTHS module.",
    passportConnection:
      "Following a recommendation does not earn credit by itself. Eligible, verified participation can later appear in Passport.",
    icon: Radio,
    accent: "text-red-400",
    glow: "from-red-950/80 to-neutral-950",
  },
  {
    slug: "circles",
    name: "Circles",
    eyebrow: "Find community with context",
    purpose: "Intentional communities and their shared activity.",
    summary:
      "Circles will make it easier to discover communities with clear purpose, expectations, hosts, and ways to participate—without trying to replace Discord.",
    audience: [
      "Community members",
      "Hosts and organizers",
      "Identity and interest-based groups",
    ],
    capabilities: [
      "Discover public and private communities",
      "Understand rules before joining",
      "See related sessions and opportunities",
    ],
    mvpIncludes: [
      "Circle discovery",
      "Membership and requests",
      "Community roles",
      "Associated activity",
    ],
    notIncluded: [
      "Real-time chat",
      "Endless social feeds",
      "Unmoderated anonymous spaces",
    ],
    pulseConnection:
      "A Connect, Play, Create, Focus, or Reset Pulse can lead to Circles whose purpose and participation style match the day.",
    passportConnection:
      "Eligible hosted sessions, volunteering, and verified Circle contributions can build a member’s Passport history.",
    icon: HeartHandshake,
    accent: "text-rose-300",
    glow: "from-rose-950/70 to-neutral-950",
  },
  {
    slug: "commons",
    name: "Creator Commons",
    eyebrow: "Make the right collaboration possible",
    purpose: "Creator collaboration and opportunities.",
    summary:
      "Creator Commons will connect skills, needs, and creative capacity through clearly structured opportunities built for respectful collaboration.",
    audience: [
      "Creators and producers",
      "People offering skills or equipment",
      "Teams forming around a project",
    ],
    capabilities: [
      "Browse creator opportunities",
      "Filter by skill, format, and compensation",
      "Express interest and confirm completion",
    ],
    mvpIncludes: [
      "Opportunity discovery",
      "Structured responses",
      "Saved opportunities",
      "Completion workflow",
    ],
    notIncluded: [
      "Payments or escrow",
      "Direct messaging",
      "Complex contracts",
    ],
    pulseConnection:
      "A Create Pulse can surface collaborations that match available time, format, skills, and social intensity.",
    passportConnection:
      "A collaboration can contribute to Passport only after an authorized completion workflow—not through self-issued credit.",
    icon: Aperture,
    accent: "text-amber-200",
    glow: "from-amber-950/60 to-neutral-950",
  },
  {
    slug: "realm",
    name: "Fifth Realm",
    eyebrow: "Enter worlds through people",
    purpose: "Campaign and immersive-story coordination.",
    summary:
      "Fifth Realm will help players, game masters, and worldbuilders discover compatible campaigns and coordinate participation around clear expectations.",
    audience: [
      "Tabletop players",
      "Game masters",
      "Worldbuilders and immersive storytellers",
    ],
    capabilities: [
      "Discover campaigns",
      "Filter by system and experience",
      "Apply and coordinate campaign sessions",
    ],
    mvpIncludes: [
      "Campaign profiles",
      "Player applications",
      "Game-master tools",
      "Associated sessions",
    ],
    notIncluded: [
      "Virtual tabletop tools",
      "Proprietary rules",
      "Copyrighted character builders",
    ],
    pulseConnection:
      "A Play or Create Pulse can surface campaigns that match format, experience level, schedule, and desired social energy.",
    passportConnection:
      "Verified campaign participation and completion can become part of Passport without turning play into a leaderboard.",
    icon: Gamepad2,
    accent: "text-violet-300",
    glow: "from-violet-950/70 to-neutral-950",
  },
  {
    slug: "passport",
    name: "Passport",
    eyebrow: "Contribution, made credible",
    purpose: "Verified contribution and participation history.",
    summary:
      "Passport will give members a structured record of meaningful participation—attendance, hosting, volunteering, collaboration, and campaign activity.",
    audience: [
      "Active community members",
      "Hosts and volunteers",
      "Organizations issuing verified activity",
    ],
    capabilities: [
      "View verified participation",
      "Understand contribution categories",
      "Control what profile highlights are public",
    ],
    mvpIncludes: [
      "Verified entries",
      "Contribution categories",
      "Recent activity",
      "Duplicate prevention",
    ],
    notIncluded: [
      "Public leaderboards",
      "Popularity rankings",
      "Self-verification",
    ],
    pulseConnection:
      "Pulse helps members find a fitting next action; Passport records only the eligible participation that is later verified.",
    passportConnection:
      "Passport is the shared outcome layer connecting participation across Sessions, Circles, Commons, and Fifth Realm.",
    icon: BadgeCheck,
    accent: "text-emerald-300",
    glow: "from-emerald-950/60 to-neutral-950",
  },
];

export type PlatformModuleSlug = PlatformModule["slug"];

export function getPlatformModule(slug: PlatformModuleSlug) {
  return platformModules.find((module) => module.slug === slug);
}
