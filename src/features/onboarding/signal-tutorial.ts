import {
  Activity,
  BadgeCheck,
  Bell,
  CircleUserRound,
  Compass,
  House,
  type LucideIcon,
  Palette,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

export type TutorialStep = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  Icon: LucideIcon;
  destination?: "commons" | "realm" | "passport";
};

export const tutorialSteps: TutorialStep[] = [
  {
    eyebrow: "Your starting point",
    title: "Home keeps participation finite.",
    description:
      "See your current Pulse and a limited set of meaningful updates—without an infinite feed or passive activity tracking.",
    href: "/home",
    cta: "Visit Home",
    Icon: House,
  },
  {
    eyebrow: "Tell SIGNAL what fits",
    title: "Pulse begins with what you choose.",
    description:
      "Share your current energy, time, social pace, and format preferences. A Pulse expires instead of becoming a permanent profile judgment.",
    href: "/home/pulse",
    cta: "Check Your Pulse",
    Icon: Activity,
  },
  {
    eyebrow: "Show up together",
    title: "Sessions are specific things people are doing.",
    description:
      "Find outings, game nights, workshops, coworking, and other plans with a clear time, host, and participation path.",
    href: "/home/sessions",
    cta: "Explore Sessions",
    Icon: Sparkles,
  },
  {
    eyebrow: "Find your people",
    title: "Circles are ongoing communities.",
    description:
      "Join interest-based spaces with visible rules, membership controls, and owner-managed community boundaries.",
    href: "/home/circles",
    cta: "Explore Circles",
    Icon: UsersRound,
  },
  {
    eyebrow: "Build with others",
    title: "Creator Commons makes collaboration clearer.",
    description:
      "Discover opportunities with stated scope, time, format, and compensation expectations before you respond.",
    href: "/home/commons",
    cta: "Explore Commons",
    Icon: Palette,
    destination: "commons",
  },
  {
    eyebrow: "Step into the Realm",
    title: "Fifth Realm is for intentional tabletop play.",
    description:
      "Find campaigns with schedules, table expectations, safety information, and an application process.",
    href: "/home/realm",
    cta: "Visit Fifth Realm",
    Icon: Compass,
    destination: "realm",
  },
  {
    eyebrow: "A trusted private record",
    title: "Passport records verified participation.",
    description:
      "Only eligible activity confirmed by an authorized workflow becomes verified Passport history. Tutorial tasks never impersonate that record.",
    href: "/home/passport",
    cta: "Open Passport",
    Icon: BadgeCheck,
    destination: "passport",
  },
  {
    eyebrow: "Make it yours",
    title: "Your profile can be expressive and controlled.",
    description:
      "Choose what you share, customize your appearance, and preview the same profile other members can see.",
    href: "/account",
    cta: "Customize Profile",
    Icon: CircleUserRound,
  },
  {
    eyebrow: "Private updates",
    title: "Inbox and notifications help you respond.",
    description:
      "Review invitations, participation changes, and account-relevant updates without turning them into a public activity feed.",
    href: "/home/notifications",
    cta: "Open Notifications",
    Icon: Bell,
  },
  {
    eyebrow: "You stay in control",
    title: "Account and Safety hold your boundaries.",
    description:
      "Manage blocking, muting, filtered phrases, profile settings, and account-data requests from one clear area.",
    href: "/account/safety",
    cta: "Review Safety Controls",
    Icon: ShieldCheck,
  },
];

export const starterTasks = [
  {
    key: "tour_complete",
    name: "Welcome to SIGNAL",
    description: "Complete the short product tour.",
    href: "/home/getting-started",
  },
  {
    key: "profile_customized",
    name: "Make It Yours",
    description: "Add a profile detail or visual customization.",
    href: "/account",
  },
  {
    key: "pulse_complete",
    name: "Check Your Pulse",
    description: "Complete your first private Pulse check-in.",
    href: "/home/pulse",
  },
  {
    key: "circle_joined",
    name: "Find Your People",
    description: "Become an active member of a Circle.",
    href: "/home/circles",
  },
  {
    key: "session_registered",
    name: "Show Up",
    description: "Register for a Session.",
    href: "/home/sessions",
  },
  {
    key: "commons_explored",
    name: "Explore Commons",
    description: "Visit Creator Commons from the guided path.",
    href: "/home/commons",
  },
  {
    key: "realm_visited",
    name: "Step Into The Realm",
    description: "Visit Fifth Realm from the guided path.",
    href: "/home/realm",
  },
  {
    key: "passport_opened",
    name: "Open Passport",
    description: "Learn how verified participation is recorded.",
    href: "/home/passport",
  },
] as const;

export type StarterTaskKey = (typeof starterTasks)[number]["key"];
