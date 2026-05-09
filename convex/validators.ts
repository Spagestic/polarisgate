import { v } from "convex/values";

export const educationLevelValidator = v.union(
  v.literal("secondary"),
  v.literal("diploma"),
  v.literal("bachelors"),
  v.literal("masters"),
  v.literal("doctorate"),
);

export const nullableEducationLevelValidator = v.union(
  educationLevelValidator,
  v.null(),
);

export const languageLevelValidator = v.union(
  v.literal("basic"),
  v.literal("intermediate"),
  v.literal("advanced"),
  v.literal("native"),
);

export const nullableLanguageLevelValidator = v.union(
  languageLevelValidator,
  v.null(),
);

export const migrationGoalValidator = v.union(
  v.literal("study"),
  v.literal("work"),
  v.literal("family"),
  v.literal("investment"),
  v.literal("passport"),
  v.literal("fast_pr"),
  v.literal("low_cost"),
);

export const pathwayCategoryValidator = v.union(
  v.literal("skilled_worker"),
  v.literal("study_to_pr"),
  v.literal("employer_sponsored"),
  v.literal("family"),
  v.literal("investment"),
);

export const profileArgsValidator = {
  residenceCountry: v.string(),
  citizenshipCountry: v.string(),
  age: v.number(),
  savingsUsd: v.number(),
  educationLevel: educationLevelValidator,
  occupation: v.string(),
  languageLevel: languageLevelValidator,
  goals: v.array(migrationGoalValidator),
  movingWithFamily: v.boolean(),
  targetCountryId: v.union(v.string(), v.null()),
};

export const profileDocValidator = v.object({
  _id: v.id("savedProfiles"),
  _creationTime: v.number(),
  userId: v.id("users"),
  ...profileArgsValidator,
  updatedAt: v.number(),
});

export const destinationArgsValidator = {
  countryId: v.string(),
  iso2: v.string(),
  name: v.string(),
  region: v.string(),
  longitude: v.number(),
  latitude: v.number(),
  passportStrength: v.union(
    v.literal("strong"),
    v.literal("very_strong"),
    v.literal("exceptional"),
  ),
  costLevel: v.union(
    v.literal("low"),
    v.literal("medium"),
    v.literal("high"),
    v.literal("very_high"),
  ),
  officialImmigrationUrl: v.string(),
};

export const destinationDocValidator = v.object({
  _id: v.id("destinations"),
  _creationTime: v.number(),
  ...destinationArgsValidator,
  updatedAt: v.number(),
});

export const pathwayArgsValidator = {
  pathwayId: v.string(),
  countryId: v.string(),
  name: v.string(),
  category: pathwayCategoryValidator,
  summary: v.string(),
  prTimelineMinMonths: v.number(),
  prTimelineMaxMonths: v.number(),
  citizenshipTimelineMinYears: v.union(v.number(), v.null()),
  citizenshipTimelineMaxYears: v.union(v.number(), v.null()),
  minSavingsUsd: v.number(),
  minEducationLevel: nullableEducationLevelValidator,
  minLanguageLevel: nullableLanguageLevelValidator,
  idealAgeMax: v.union(v.number(), v.null()),
  familyFriendly: v.boolean(),
  documents: v.array(v.string()),
  eligibilityNotes: v.array(v.string()),
  lastReviewed: v.string(),
  confidence: v.union(
    v.literal("seeded"),
    v.literal("agent_draft"),
    v.literal("verified"),
  ),
};

export const pathwayDocValidator = v.object({
  _id: v.id("pathwaySnapshots"),
  _creationTime: v.number(),
  ...pathwayArgsValidator,
  updatedAt: v.number(),
});

export const sourceLinkArgsValidator = {
  title: v.string(),
  url: v.string(),
  publisher: v.string(),
};

export const sourceLinkDocValidator = v.object({
  _id: v.id("sourceLinks"),
  _creationTime: v.number(),
  pathwaySnapshotId: v.id("pathwaySnapshots"),
  ...sourceLinkArgsValidator,
  retrievedAt: v.number(),
});

export const researchJobDocValidator = v.object({
  _id: v.id("researchJobs"),
  _creationTime: v.number(),
  countryId: v.string(),
  requestedBy: v.union(v.id("users"), v.null()),
  status: v.union(
    v.literal("queued"),
    v.literal("running"),
    v.literal("completed"),
    v.literal("failed"),
  ),
  query: v.string(),
  error: v.union(v.string(), v.null()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const historyMessageValidator = v.object({
  role: v.union(
    v.literal("user"),
    v.literal("assistant"),
    v.literal("agent"),
    v.literal("tool"),
  ),
  content: v.string(),
});

export const recommendationSourceValidator = v.object({
  title: v.string(),
  url: v.string(),
  publisher: v.string(),
});

export const metricValueValidator = v.object({
  value: v.union(v.number(), v.null()),
  year: v.union(v.string(), v.null()),
});

export const countryEconomicMetricsValidator = v.object({
  incomeLevel: v.union(v.string(), v.null()),
  gdpUsd: metricValueValidator,
  gdpPerCapitaUsd: metricValueValidator,
  gdpGrowthPct: metricValueValidator,
  inflationPct: metricValueValidator,
  unemploymentPct: metricValueValidator,
  population: metricValueValidator,
});

export const countryRecommendationValidator = v.object({
  id: v.string(),
  country: v.object({
    name: v.string(),
    officialName: v.union(v.string(), v.null()),
    iso2: v.string(),
    iso3: v.string(),
    capital: v.union(v.string(), v.null()),
    region: v.union(v.string(), v.null()),
    subregion: v.union(v.string(), v.null()),
    flag: v.union(v.string(), v.null()),
    latitude: v.number(),
    longitude: v.number(),
    areaKm2: v.union(v.number(), v.null()),
  }),
  score: v.number(),
  bestPathway: v.string(),
  pathwayCategory: pathwayCategoryValidator,
  summary: v.string(),
  prTimelineMonths: v.array(v.number()),
  citizenshipTimelineYears: v.union(v.array(v.number()), v.null()),
  minSavingsUsd: v.union(v.number(), v.null()),
  documents: v.array(v.string()),
  eligibilityNotes: v.array(v.string()),
  cautions: v.array(v.string()),
  sources: v.array(recommendationSourceValidator),
  metrics: v.optional(countryEconomicMetricsValidator),
  confidence: v.union(
    v.literal("seeded"),
    v.literal("agent_draft"),
    v.literal("verified"),
  ),
});

export const searchHistoryArgsValidator = {
  prompt: v.string(),
  messages: v.array(historyMessageValidator),
  recommendations: v.array(countryRecommendationValidator),
  summary: v.union(v.string(), v.null()),
};

export const searchHistoryDocValidator = v.object({
  _id: v.id("searchHistories"),
  _creationTime: v.number(),
  userId: v.id("users"),
  ...searchHistoryArgsValidator,
  createdAt: v.number(),
});
