import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { researchCountryPathway } from "../lib/agent/research";
import type { Id } from "./_generated/dataModel";

export const refreshCountryPathway = action({
  args: {
    country: v.object({
      id: v.string(),
      name: v.string(),
      officialImmigrationUrl: v.string(),
    }),
    pathwayFocus: v.optional(v.string()),
  },
  returns: v.object({
    researchJobId: v.id("researchJobs"),
    pathwaySnapshotId: v.id("pathwaySnapshots"),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    researchJobId: Id<"researchJobs">;
    pathwaySnapshotId: Id<"pathwaySnapshots">;
  }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const query = `${args.country.name} ${args.pathwayFocus ?? "permanent residence pathways official requirements"}`;
    const researchJobId: Id<"researchJobs"> = await ctx.runMutation(
      internal.researchJobs.createInternal,
      {
        countryId: args.country.id,
        requestedBy: userId,
        query,
      },
    );

    await ctx.runMutation(internal.researchJobs.updateStatusInternal, {
      researchJobId,
      status: "running",
      error: null,
    });

    try {
      const pathway = await researchCountryPathway({
        country: args.country,
        pathwayFocus: args.pathwayFocus,
      });
      const pathwaySnapshotId: Id<"pathwaySnapshots"> = await ctx.runMutation(
        internal.pathways.upsertInternal,
        {
          pathway: {
            pathwayId: pathway.id,
            countryId: pathway.countryId,
            name: pathway.name,
            category: pathway.category,
            summary: pathway.summary,
            prTimelineMinMonths: pathway.prTimelineMonths[0],
            prTimelineMaxMonths: pathway.prTimelineMonths[1],
            citizenshipTimelineMinYears:
              pathway.citizenshipTimelineYears?.[0] ?? null,
            citizenshipTimelineMaxYears:
              pathway.citizenshipTimelineYears?.[1] ?? null,
            minSavingsUsd: pathway.minSavingsUsd,
            minEducationLevel: pathway.minEducationLevel,
            minLanguageLevel: pathway.minLanguageLevel,
            idealAgeMax: pathway.idealAgeMax,
            familyFriendly: pathway.familyFriendly,
            documents: pathway.documents,
            eligibilityNotes: pathway.eligibilityNotes,
            lastReviewed: pathway.lastReviewed,
            confidence: pathway.confidence,
          },
          sourceLinks: pathway.sourceLinks,
        },
      );

      await ctx.runMutation(internal.researchJobs.updateStatusInternal, {
        researchJobId,
        status: "completed",
        error: null,
      });

      return { researchJobId, pathwaySnapshotId };
    } catch (error) {
      await ctx.runMutation(internal.researchJobs.updateStatusInternal, {
        researchJobId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  },
});
