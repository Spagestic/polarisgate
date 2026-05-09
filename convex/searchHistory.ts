import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import {
  historyMessageValidator,
  countryRecommendationValidator,
  searchHistoryDocValidator,
} from "./validators";

const MAX_HISTORY_ITEMS = 20;
const MAX_MESSAGES_PER_HISTORY = 40;
const MAX_RECOMMENDATIONS_PER_HISTORY = 8;

export const listMine = query({
  args: {},
  returns: v.array(searchHistoryDocValidator),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("searchHistories")
      .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(MAX_HISTORY_ITEMS);
  },
});

export const save = mutation({
  args: {
    prompt: v.string(),
    messages: v.array(historyMessageValidator),
    recommendations: v.array(countryRecommendationValidator),
    summary: v.union(v.string(), v.null()),
  },
  returns: v.id("searchHistories"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const prompt = args.prompt.trim();
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const createdAt = Date.now();
    const searchHistoryId = await ctx.db.insert("searchHistories", {
      userId,
      prompt,
      messages: args.messages.slice(-MAX_MESSAGES_PER_HISTORY),
      recommendations: args.recommendations.slice(
        0,
        MAX_RECOMMENDATIONS_PER_HISTORY,
      ),
      summary: args.summary,
      createdAt,
    });

    const historyItems = await ctx.db
      .query("searchHistories")
      .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(MAX_HISTORY_ITEMS + 5);

    await Promise.all(
      historyItems
        .slice(MAX_HISTORY_ITEMS)
        .map((historyItem) => ctx.db.delete(historyItem._id)),
    );

    return searchHistoryId;
  },
});
