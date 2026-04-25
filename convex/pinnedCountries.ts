import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

const pinnedCountryDocValidator = v.object({
  _id: v.id("pinnedCountries"),
  _creationTime: v.number(),
  userId: v.id("users"),
  countryId: v.string(),
  createdAt: v.number(),
});

export const listMine = query({
  args: {},
  returns: v.array(pinnedCountryDocValidator),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("pinnedCountries")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(20);
  },
});

export const pin = mutation({
  args: { countryId: v.string() },
  returns: v.id("pinnedCountries"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("pinnedCountries")
      .withIndex("by_userId_and_countryId", (q) =>
        q.eq("userId", userId).eq("countryId", args.countryId),
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("pinnedCountries", {
      userId,
      countryId: args.countryId,
      createdAt: Date.now(),
    });
  },
});

export const unpin = mutation({
  args: { countryId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("pinnedCountries")
      .withIndex("by_userId_and_countryId", (q) =>
        q.eq("userId", userId).eq("countryId", args.countryId),
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return null;
  },
});
