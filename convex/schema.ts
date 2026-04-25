import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  users: defineTable({
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.float64()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.float64()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),
  savedProfiles: defineTable({
    userId: v.id("users"),
    residenceCountry: v.string(),
    citizenshipCountry: v.string(),
    age: v.number(),
    savingsUsd: v.number(),
    educationLevel: v.union(
      v.literal("secondary"),
      v.literal("diploma"),
      v.literal("bachelors"),
      v.literal("masters"),
      v.literal("doctorate"),
    ),
    occupation: v.string(),
    languageLevel: v.union(
      v.literal("basic"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("native"),
    ),
    goals: v.array(
      v.union(
        v.literal("study"),
        v.literal("work"),
        v.literal("family"),
        v.literal("investment"),
        v.literal("passport"),
        v.literal("fast_pr"),
        v.literal("low_cost"),
      ),
    ),
    movingWithFamily: v.boolean(),
    targetCountryId: v.union(v.string(), v.null()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
  destinations: defineTable({
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
    updatedAt: v.number(),
  }).index("by_countryId", ["countryId"]),
  pathwaySnapshots: defineTable({
    pathwayId: v.string(),
    countryId: v.string(),
    name: v.string(),
    category: v.union(
      v.literal("skilled_worker"),
      v.literal("study_to_pr"),
      v.literal("employer_sponsored"),
      v.literal("family"),
      v.literal("investment"),
    ),
    summary: v.string(),
    prTimelineMinMonths: v.number(),
    prTimelineMaxMonths: v.number(),
    citizenshipTimelineMinYears: v.union(v.number(), v.null()),
    citizenshipTimelineMaxYears: v.union(v.number(), v.null()),
    minSavingsUsd: v.number(),
    minEducationLevel: v.union(
      v.literal("secondary"),
      v.literal("diploma"),
      v.literal("bachelors"),
      v.literal("masters"),
      v.literal("doctorate"),
      v.null(),
    ),
    minLanguageLevel: v.union(
      v.literal("basic"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("native"),
      v.null(),
    ),
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
    updatedAt: v.number(),
  })
    .index("by_pathwayId", ["pathwayId"])
    .index("by_countryId", ["countryId"])
    .index("by_countryId_and_category", ["countryId", "category"]),
  sourceLinks: defineTable({
    pathwaySnapshotId: v.id("pathwaySnapshots"),
    title: v.string(),
    url: v.string(),
    publisher: v.string(),
    retrievedAt: v.number(),
  }).index("by_pathwaySnapshotId", ["pathwaySnapshotId"]),
  pinnedCountries: defineTable({
    userId: v.id("users"),
    countryId: v.string(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_countryId", ["userId", "countryId"]),
  researchJobs: defineTable({
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
  })
    .index("by_countryId", ["countryId"])
    .index("by_status", ["status"]),
});
