"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
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

type MistralCandidate = Omit<Candidate, "sources"> & {
  sourceUrls?: string[];
};

function publisherFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Official source";
  }
}

function sanitizeJson(text: string) {
  return text.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? text;
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
  const mistralApiKey = process.env.MISTRAL_API_KEY;
  if (!mistralApiKey) {
    throw new Error("MISTRAL_API_KEY must be set for dynamic country discovery.");
  }

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${mistralApiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-medium-3-5",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are an immigration research agent. Choose suitable migration destination countries from web evidence, not from a fixed list. Return strict JSON only. Avoid legal certainty.",
        },
        {
          role: "user",
          content: JSON.stringify({
            userPrompt: prompt,
            instructions: [
              "Return 3 to 5 destination countries.",
              "Use the user's goals, budget, age, residence/citizenship, languages, occupation, and region preferences.",
              "Prefer official immigration source URLs when available.",
              "Do not always choose common countries; pick what fits the prompt.",
              "Use ISO2 and ISO3 country codes.",
              "Estimate timelines conservatively as two-number arrays.",
            ],
            schema: {
              countries: [
                {
                  id: "lowercase kebab-case country id",
                  countryName: "country common name",
                  iso2: "ISO 3166-1 alpha-2",
                  iso3: "ISO 3166-1 alpha-3",
                  officialImmigrationUrl: "best official immigration URL",
                  defaultPathway: "primary pathway name",
                  pathwayCategory:
                    "skilled_worker | study_to_pr | employer_sponsored | family | investment",
                  prTimelineMonths: "[min, max]",
                  citizenshipTimelineYears: "[min, max] or null",
                  minSavingsUsd: "number or null",
                  score: "number 1-99",
                  summary: "2 concise sentences",
                  documents: "string[]",
                  eligibilityNotes: "string[]",
                  cautions: "string[]",
                  sourceUrls: "string[] of URLs from supplied evidence or official websites",
                },
              ],
            },
            sources,
          }),
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error("Country discovery model call failed.");
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Country discovery returned no content.");
  }

  const parsed = JSON.parse(sanitizeJson(content)) as {
    countries?: MistralCandidate[];
  };

  return Array.isArray(parsed.countries) ? parsed.countries : [];
}

function sourceLinksForCandidate(
  candidate: MistralCandidate,
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
