import type { Database } from "@/types/database";

type StimulationLevel = Database["public"]["Enums"]["pulse_stimulation_level"];
type SocialIntensity = Database["public"]["Enums"]["pulse_social_intensity"];
type ParticipationFormat = Database["public"]["Enums"]["participation_format"];

export type PulseRecommendationInput = {
  modeSlug: string;
  energyLevel: number;
  stimulationLevel: StimulationLevel;
  socialIntensity: SocialIntensity;
  preferredFormat: ParticipationFormat;
  availableMinutes: number;
  maximumTravelMiles: number | null;
  interestIds: string[];
};

export type RecommendationCandidate = {
  id: string;
  title: string;
  module: "circles" | "commons" | "realm" | "sessions";
  startsAt?: string | null;
  modeSlugs?: string[];
  energyRange?: { minimum: number; maximum: number };
  stimulationLevels?: StimulationLevel[];
  socialIntensities?: SocialIntensity[];
  format?: ParticipationFormat;
  durationMinutes?: number | null;
  distanceMiles?: number | null;
  interestIds?: string[];
};

export type RecommendationReason =
  | "Fits your current mode"
  | "Matches your available energy"
  | "Matches your preferred stimulation"
  | "Matches your social pace"
  | "Works with your preferred format"
  | "Fits your available time"
  | "Connects with today's interests"
  | "Within your travel range";

export type RankedRecommendation = {
  candidate: RecommendationCandidate;
  reasons: RecommendationReason[];
};
