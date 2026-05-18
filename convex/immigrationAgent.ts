"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import {
  countryDiscoveryResponseSchema,
  generateGemmaJson,
  parseModelJson,
} from "../lib/agent/gemini";
import { getFirecrawlClient } from "./firecrawl/client";

const pathwayCategoryValidator = v.union(
  v.literal("skilled_worker"),
  v.literal("study_to_pr"),
  v.literal("employer_sponsored"),
  v.literal("family"),
  v.literal("investment"),
);

const sourceValidator = v.object({
  title: v.string(),
  url: v.string(),
  publisher: v.string(),
});

const candidateValidator = v.object({
  id: v.string(),
  countryName: v.string(),
  iso2: v.string(),
  iso3: v.string(),
  officialImmigrationUrl: v.string(),
  defaultPathway: v.string(),
  pathwayCategory: pathwayCategoryValidator,
  prTimelineMonths: v.array(v.number()),
  citizenshipTimelineYears: v.union(v.array(v.number()), v.null()),
  minSavingsUsd: v.union(v.number(), v.null()),
  score: v.number(),
  summary: v.string(),
  documents: v.array(v.string()),
  eligibilityNotes: v.array(v.string()),
  cautions: v.array(v.string()),
  sources: v.array(sourceValidator),
});

type SearchSource = {
  title: string;
  url: string;
  publisher: string;
  snippet: string;
};

type Candidate = typeof candidateValidator.type;

type DiscoveredCandidate = Omit<Candidate, "sources"> & {
  sourceUrls?: string[];
};

function publisherFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Official source";
  }
}

function searchRecordsFromPayload(payload: unknown) {
  const records =
    typeof payload === "object" && payload !== null && "data" in payload
      ? (payload as { data?: unknown }).data
      : payload;

  if (Array.isArray(records)) return records;

  if (typeof records === "object" && records !== null) {
    const result = records as {
      web?: unknown;
      results?: unknown;
      data?: unknown;
    };

    for (const candidate of [result.web, result.results, result.data]) {
      if (Array.isArray(candidate)) return candidate;
    }
  }

  return [];
}

function normalizeSearchResults(payload: unknown): SearchSource[] {
  const records = searchRecordsFromPayload(payload);

  return records
    .map((record): SearchSource | null => {
      if (typeof record !== "object" || record === null) return null;
      const item = record as {
        title?: unknown;
        url?: unknown;
        markdown?: unknown;
        description?: unknown;
        content?: unknown;
      };
      if (typeof item.url !== "string") return null;

      return {
        title:
          typeof item.title === "string"
            ? item.title
            : publisherFromUrl(item.url),
        url: item.url,
        publisher: publisherFromUrl(item.url),
        snippet:
          typeof item.markdown === "string"
            ? item.markdown.slice(0, 1600)
            : typeof item.description === "string"
              ? item.description
              : typeof item.content === "string"
                ? item.content.slice(0, 1600)
                : "",
      };
    })
    .filter((source): source is SearchSource => source !== null)
    .slice(0, 12);
}

async function firecrawlSearch(query: string, limit = 8) {
  const firecrawl = getFirecrawlClient();
  const result = await firecrawl.search(query, {
    limit,
    sources: ["web"],
    timeout: 15000,
    ignoreInvalidURLs: true,
  });

  return normalizeSearchResults(result);
}

async function safeFirecrawlSearch(query: string, limit = 8) {
  try {
    return await firecrawlSearch(query, limit);
  } catch (error) {
    console.warn("Firecrawl search failed", {
      query,
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

async function extractCandidatesWithModel({
  prompt,
  sources,
}: {
  prompt: string;
  sources: SearchSource[];
}) {
  const sourceDigest = sources.map((source) => ({
    title: source.title,
    url: source.url,
    snippet: source.snippet.slice(0, 800),
  }));

  const content = await generateGemmaJson({
    systemInstruction:
      "You are an immigration research agent. Pick 3-5 suitable destination countries from the web evidence. Output only JSON matching the response schema. Do not use markdown, bullet lists, or conversational text. Avoid legal certainty.",
    userContent: [
      "Immigration request:",
      prompt,
      "",
      "Web evidence (JSON):",
      JSON.stringify(sourceDigest),
      "",
      "Rules:",
      "- Match the user's goals, budget, age, residence, languages, occupation, and region preferences.",
      "- Prefer official immigration URLs from the evidence when possible.",
      "- Use valid ISO2 and ISO3 codes.",
      "- Estimate timelines conservatively as [min, max] number arrays.",
    ].join("\n"),
    temperature: 0.2,
    responseSchema: countryDiscoveryResponseSchema,
  });

  const parsed = parseModelJson<{ countries?: DiscoveredCandidate[] }>(content);

  return Array.isArray(parsed.countries) ? parsed.countries : [];
}

function sourceLinksForCandidate(
  candidate: DiscoveredCandidate,
  sources: SearchSource[],
) {
  const urls = new Set(candidate.sourceUrls ?? []);
  const matched = sources.filter(
    (source) =>
      urls.has(source.url) ||
      source.url
        .toLowerCase()
        .includes(candidate.countryName.toLowerCase().replace(/\s+/g, "-")) ||
      source.title.toLowerCase().includes(candidate.countryName.toLowerCase()),
  );
  const selected = matched.length > 0 ? matched : sources.slice(0, 3);

  return selected.slice(0, 5).map((source) => ({
    title: source.title,
    url: source.url,
    publisher: source.publisher,
  }));
}

function normalizeNumberPair(values: number[] | null | undefined) {
  if (!Array.isArray(values) || values.length === 0) return [24, 60];
  const first = Number(values[0]);
  const second = Number(values[1] ?? values[0]);
  return [
    Number.isFinite(first) ? first : 24,
    Number.isFinite(second) ? second : 60,
  ];
}

export const discoverCountries = action({
  args: {
    prompt: v.string(),
  },
  returns: v.array(candidateValidator),
  handler: async (ctx, args) => {
    const prompt = args.prompt.trim();
    if (!prompt) {
      throw new Error("Prompt is required.");
    }

    const broadSources = await safeFirecrawlSearch(
      `best countries immigration permanent residence pathways for: ${prompt}`,
      6,
    );
    const extracted = await extractCandidatesWithModel({
      prompt,
      sources: broadSources,
    });

    const unique = extracted.filter(
      (candidate, index, all) =>
        candidate.countryName &&
        candidate.iso2 &&
        all.findIndex(
          (item) => item.iso2.toUpperCase() === candidate.iso2.toUpperCase(),
        ) === index,
    );

    const candidates = await Promise.all(
      unique.slice(0, 5).map(async (candidate) => {
        const countrySources = await safeFirecrawlSearch(
          `${candidate.countryName} official immigration ${candidate.defaultPathway}`,
          2,
        );
        const sources = sourceLinksForCandidate(candidate, [
          ...countrySources,
          ...broadSources,
        ]);
      const displaySources =
        sources.length > 0
          ? sources
          : candidate.officialImmigrationUrl
            ? [
                {
                  title: `${candidate.countryName} official immigration`,
                  url: candidate.officialImmigrationUrl,
                  publisher: publisherFromUrl(candidate.officialImmigrationUrl),
                },
              ]
            : [];

        return {
          id:
            candidate.id ||
            candidate.countryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          countryName: candidate.countryName,
          iso2: candidate.iso2.toUpperCase(),
          iso3: candidate.iso3.toUpperCase(),
          officialImmigrationUrl:
            candidate.officialImmigrationUrl || displaySources[0]?.url || "",
          defaultPathway: candidate.defaultPathway,
          pathwayCategory: candidate.pathwayCategory,
          prTimelineMonths: normalizeNumberPair(candidate.prTimelineMonths),
          citizenshipTimelineYears: candidate.citizenshipTimelineYears
            ? normalizeNumberPair(candidate.citizenshipTimelineYears)
            : null,
          minSavingsUsd:
            typeof candidate.minSavingsUsd === "number"
              ? candidate.minSavingsUsd
              : null,
          score:
            typeof candidate.score === "number"
              ? Math.min(99, Math.max(1, Math.round(candidate.score)))
              : 70,
          summary: candidate.summary || candidate.defaultPathway,
          documents: candidate.documents?.length
            ? candidate.documents.slice(0, 8)
            : ["Passport", "Proof of funds", "Application forms"],
          eligibilityNotes: candidate.eligibilityNotes?.length
            ? candidate.eligibilityNotes.slice(0, 8)
            : ["Verify requirements against the linked official source."],
          cautions: candidate.cautions?.length
            ? candidate.cautions.slice(0, 6)
            : ["Immigration rules change frequently; verify before applying."],
          sources: displaySources,
        };
      }),
    );

    return candidates;
  },
});
