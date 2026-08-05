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
  artwork: string;
  accent: string;
  glow: string;
  memberHref?: string;
};

export const platformModules: PlatformModule[] = [
  {
    slug: "pulse",
    name: "Pulse",
    eyebrow: "Start with your capacity",
    purpose: "Daily capacity and transparent recommendations.",
    summary: "Check in with your energy and choose how you want to engage.",
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
    artwork: "/images/modules/pulse-art.png",
    accent: "text-[#f359d2]",
    glow: "from-[#6c14ce]/20 to-[#020205]",
    memberHref: "/home/pulse",
  },
  {
    slug: "circles",
    name: "Circles",
    eyebrow: "Find community with context",
    purpose: "Intentional communities and their shared activity.",
    summary:
      "Connect with communities that match your interests, energy, and social preferences.",
    audience: [
      "Community members",
      "Hosts and organizers",
      "Identity and interest-based groups",
    ],
    capabilities: [
      "Discover public communities and invited private spaces",
      "Understand rules before joining",
      "See related sessions and opportunities",
    ],
    mvpIncludes: [
      "Pulse-aware Circle discovery",
      "Open, request, and invitation membership",
      "Scoped owner, host, moderator, and member roles",
      "Associated shared Sessions",
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
    artwork: "/images/modules/circles-art.png",
    accent: "text-[#22d3ee]",
    glow: "from-[#22d3ee]/15 to-[#020205]",
    memberHref: "/home/circles",
  },
  {
    slug: "commons",
    name: "Creator Commons",
    eyebrow: "Make the right collaboration possible",
    purpose: "Creator collaboration and opportunities.",
    summary:
      "Create, collaborate, and grow with other creators, producers, and teams.",
    audience: [
      "Creators and producers",
      "People offering skills or equipment",
      "Teams forming around a project",
    ],
    capabilities: [
      "Browse creator opportunities",
      "Understand required skills, format, scope, and openings",
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
    artwork: "/images/modules/commons-art.png",
    accent: "text-[#7cff00]",
    glow: "from-[#7cff00]/10 to-[#020205]",
    memberHref: "/home/commons",
  },
  {
    slug: "realm",
    name: "Fifth Realm",
    eyebrow: "Enter worlds through people",
    purpose: "Campaign and immersive-story coordination.",
    summary:
      "Explore immersive worlds and campaigns made by other players, storytellers, and game masters.",
    audience: [
      "Tabletop players",
      "Game masters",
      "Worldbuilders and immersive storytellers",
    ],
    capabilities: [
      "Discover campaigns",
      "Understand genre, tone, cadence, and experience welcome",
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
    artwork: "/images/modules/realm-art.png",
    accent: "text-[#9d7cff]",
    glow: "from-[#1800ad]/25 to-[#020205]",
    memberHref: "/home/realm",
  },
  {
    slug: "passport",
    name: "Passport",
    eyebrow: "Contribution, made credible",
    purpose: "Verified contribution and participation history.",
    summary:
      "Keep a record of your participation, contributions, and activity across the ecosystem.",
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
    artwork: "/images/modules/passport-art.png",
    accent: "text-[#b8ff73]",
    glow: "from-[#7cff00]/12 to-[#020205]",
    memberHref: "/home/passport",
  },
];

export type PlatformModuleSlug = PlatformModule["slug"];

export function getPlatformModule(slug: PlatformModuleSlug) {
  return platformModules.find((module) => module.slug === slug);
}
