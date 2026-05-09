export type MigrationGoal =
  | "study"
  | "work"
  | "family"
  | "investment"
  | "passport"
  | "fast_pr"
  | "low_cost";

export type ApplicantProfile = {
  residenceCountry: string | null;
  citizenshipCountry: string | null;
  age: number | null;
  savingsUsd: number | null;
  goals: MigrationGoal[];
  educationLevel: string | null;
  occupation: string | null;
  languageLevel: string | null;
  movingWithFamily: boolean | null;
};

export type RecommendationSource = {
  title: string;
  url: string;
  publisher: string;
};

export type MetricValue = {
  value: number | null;
  year: string | null;
};

export type CountryEconomicMetrics = {
  incomeLevel: string | null;
  gdpUsd: MetricValue;
  gdpPerCapitaUsd: MetricValue;
  gdpGrowthPct: MetricValue;
  inflationPct: MetricValue;
  unemploymentPct: MetricValue;
  population: MetricValue;
};

export type CountryRecommendation = {
  id: string;
  country: {
    name: string;
    officialName: string | null;
    iso2: string;
    iso3: string;
    capital: string | null;
    region: string | null;
    subregion: string | null;
    flag: string | null;
    latitude: number;
    longitude: number;
    areaKm2: number | null;
  };
  score: number;
  bestPathway: string;
  pathwayCategory:
    | "skilled_worker"
    | "study_to_pr"
    | "employer_sponsored"
    | "family"
    | "investment";
  summary: string;
  prTimelineMonths: [number, number];
  citizenshipTimelineYears: [number, number] | null;
  minSavingsUsd: number | null;
  documents: string[];
  eligibilityNotes: string[];
  cautions: string[];
  sources: RecommendationSource[];
  metrics?: CountryEconomicMetrics;
  confidence: "seeded" | "agent_draft" | "verified";
};

export type ResearchStatus =
  | "idle"
  | "researching"
  | "complete"
  | "error";

export type AgentUiEvent =
  | {
      type: "profile_extracted";
      profile: ApplicantProfile;
    }
  | {
      type: "progress";
      message: string;
      countryId?: string;
    }
  | {
      type: "country_recommended";
      recommendation: CountryRecommendation;
    }
  | {
      type: "research_complete";
      summary: string;
    }
  | {
      type: "research_error";
      message: string;
    };

export type ChatMessage = {
  role: "user" | "assistant" | "agent" | "tool";
  content: string;
};

export type SearchHistoryEntry = {
  _id: string;
  _creationTime: number;
  userId: string;
  prompt: string;
  messages: ChatMessage[];
  recommendations: CountryRecommendation[];
  summary: string | null;
  createdAt: number;
};
