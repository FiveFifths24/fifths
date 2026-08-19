import type { Database } from "@/types/database";

type StimulationLevel = Database["public"]["Enums"]["pulse_stimulation_level"];
type SocialIntensity = Database["public"]["Enums"]["pulse_social_intensity"];
type ParticipationFormat = Database["public"]["Enums"]["participation_format"];

export type RecommendationModule = "circles" | "commons" | "realm" | "sessions";

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
  module: RecommendationModule;
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
  | "Fits Your Current Mode"
  | "Matches Your Available Energy"
  | "Matches Your Preferred Stimulation"
  | "Matches Your Social Pace"
  | "Works With Your Preferred Platform"
  | "Fits Your Available Time"
  | "Connects With Today's Interests"
  | "Within Your Travel Range";

export type RankedRecommendation = {
  candidate: RecommendationCandidate;
  reasons: RecommendationReason[];
  fit: "strong" | "good" | "possible";
};
