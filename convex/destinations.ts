import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internalMutation, query } from "./_generated/server";
import {
  destinationArgsValidator,
  destinationDocValidator,
} from "./validators";

export const list = query({
  args: {},
  returns: v.array(destinationDocValidator),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.query("destinations").take(100);
  },
});

export const getByCountryId = query({
  args: { countryId: v.string() },
  returns: v.union(destinationDocValidator, v.null()),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("destinations")
      .withIndex("by_countryId", (q) => q.eq("countryId", args.countryId))
      .first();
  },
});

export const upsertInternal = internalMutation({
  args: destinationArgsValidator,
  returns: v.id("destinations"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("destinations")
      .withIndex("by_countryId", (q) => q.eq("countryId", args.countryId))
      .first();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: now });
      return existing._id;
    }

    return await ctx.db.insert("destinations", { ...args, updatedAt: now });
  },
});
