import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internalMutation, query } from "./_generated/server";
import { researchJobDocValidator } from "./validators";

const statusValidator = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
);

export const recentForCountry = query({
  args: { countryId: v.string() },
  returns: v.array(researchJobDocValidator),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("researchJobs")
      .withIndex("by_countryId", (q) => q.eq("countryId", args.countryId))
      .order("desc")
      .take(10);
  },
});

export const createInternal = internalMutation({
  args: {
    countryId: v.string(),
    requestedBy: v.union(v.id("users"), v.null()),
    query: v.string(),
  },
  returns: v.id("researchJobs"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("researchJobs", {
      ...args,
      status: "queued",
      error: null,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateStatusInternal = internalMutation({
  args: {
    researchJobId: v.id("researchJobs"),
    status: statusValidator,
    error: v.union(v.string(), v.null()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.researchJobId, {
      status: args.status,
      error: args.error,
      updatedAt: Date.now(),
    });
    return null;
  },
});
