export type MigrationGoal =
  | "study"
  | "work"
  | "family"
  | "investment"
  | "passport"
  | "fast_pr"
  | "low_cost";

export type EducationLevel =
  | "secondary"
  | "diploma"
  | "bachelors"
  | "masters"
  | "doctorate";

export type LanguageLevel = "basic" | "intermediate" | "advanced" | "native";

export type PathwayCategory =
  | "skilled_worker"
  | "study_to_pr"
  | "employer_sponsored"
  | "family"
  | "investment";

export type SourceLink = {
  title: string;
  url: string;
  publisher: string;
};

export type ImmigrationProfile = {
  residenceCountry: string;
  citizenshipCountry: string;
  age: number;
  savingsUsd: number;
  educationLevel: EducationLevel;
  occupation: string;
  languageLevel: LanguageLevel;
  goals: MigrationGoal[];
  movingWithFamily: boolean;
  targetCountryId: string | null;
};

export type DestinationCountry = {
  id: string;
  iso2: string;
  name: string;
  region: string;
  longitude: number;
  latitude: number;
  passportStrength: "strong" | "very_strong" | "exceptional";
  costLevel: "low" | "medium" | "high" | "very_high";
  officialImmigrationUrl: string;
};

export type ImmigrationPathway = {
  id: string;
  countryId: string;
  name: string;
  category: PathwayCategory;
  summary: string;
  prTimelineMonths: [number, number];
  citizenshipTimelineYears: [number, number] | null;
  minSavingsUsd: number;
  minEducationLevel: EducationLevel | null;
  minLanguageLevel: LanguageLevel | null;
  idealAgeMax: number | null;
  familyFriendly: boolean;
  documents: string[];
  eligibilityNotes: string[];
  sourceLinks: SourceLink[];
  lastReviewed: string;
  confidence: "seeded" | "agent_draft" | "verified";
};

export type ScoreBreakdown = {
  goalFit: number;
  affordability: number;
  eligibility: number;
  timeline: number;
  familyFit: number;
};

export type CountryScore = {
  countryId: string;
  score: number;
  bestPathwayId: string | null;
  matchedPathwayIds: string[];
  summary: string;
  reasons: string[];
  cautions: string[];
  breakdown: ScoreBreakdown;
};
