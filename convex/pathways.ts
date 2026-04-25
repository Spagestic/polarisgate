import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internalMutation, query } from "./_generated/server";
import {
  pathwayArgsValidator,
  pathwayDocValidator,
  sourceLinkArgsValidator,
  sourceLinkDocValidator,
} from "./validators";

export const listForCountry = query({
  args: { countryId: v.string() },
  returns: v.array(pathwayDocValidator),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("pathwaySnapshots")
      .withIndex("by_countryId", (q) => q.eq("countryId", args.countryId))
      .take(20);
  },
});

export const listSourceLinks = query({
  args: { pathwaySnapshotId: v.id("pathwaySnapshots") },
  returns: v.array(sourceLinkDocValidator),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("sourceLinks")
      .withIndex("by_pathwaySnapshotId", (q) =>
        q.eq("pathwaySnapshotId", args.pathwaySnapshotId),
      )
      .take(20);
  },
});

export const upsertInternal = internalMutation({
  args: {
    pathway: v.object(pathwayArgsValidator),
    sourceLinks: v.array(v.object(sourceLinkArgsValidator)),
  },
  returns: v.id("pathwaySnapshots"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pathwaySnapshots")
      .withIndex("by_pathwayId", (q) =>
        q.eq("pathwayId", args.pathway.pathwayId),
      )
      .first();
    const now = Date.now();

    const pathwaySnapshotId = existing
      ? existing._id
      : await ctx.db.insert("pathwaySnapshots", {
          ...args.pathway,
          updatedAt: now,
        });

    if (existing) {
      await ctx.db.patch(pathwaySnapshotId, {
        ...args.pathway,
        updatedAt: now,
      });
    }

    const oldLinks = await ctx.db
      .query("sourceLinks")
      .withIndex("by_pathwaySnapshotId", (q) =>
        q.eq("pathwaySnapshotId", pathwaySnapshotId),
      )
      .take(100);

    await Promise.all(oldLinks.map((link) => ctx.db.delete(link._id)));
    await Promise.all(
      args.sourceLinks.map((sourceLink) =>
        ctx.db.insert("sourceLinks", {
          pathwaySnapshotId,
          ...sourceLink,
          retrievedAt: now,
        }),
      ),
    );

    return pathwaySnapshotId;
  },
});
