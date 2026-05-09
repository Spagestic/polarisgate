import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type {
  AgentUiEvent,
  ApplicantProfile,
  CountryEconomicMetrics,
  CountryRecommendation,
  MigrationGoal,
  MetricValue,
  RecommendationSource,
} from "@/lib/immigration/types";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant" | "agent" | "tool";
  content: string;
};

type ChatRequestBody = {
  message?: string;
  messages?: ChatMessage[];
};

type AgentCandidate = {
  id: string;
  countryName: string;
  iso2: string;
  iso3: string;
  officialImmigrationUrl: string;
  defaultPathway: string;
  pathwayCategory: CountryRecommendation["pathwayCategory"];
  prTimelineMonths: number[];
  citizenshipTimelineYears: number[] | null;
  minSavingsUsd: number | null;
  score: number;
  summary: string;
  documents: string[];
  eligibilityNotes: string[];
  cautions: string[];
  sources: RecommendationSource[];
};

type WorldBankIndicatorRow = {
  date?: string;
  value?: number | string | null;
};

type WorldBankCountryRow = {
  incomeLevel?: {
    value?: string | null;
  };
};

type RestCountry = {
  name?: {
    common?: string;
    official?: string;
  };
  cca2?: string;
  cca3?: string;
  capital?: string[];
  region?: string;
  subregion?: string;
  flags?: {
    svg?: string;
  };
  latlng?: number[];
  area?: number;
};

const ECONOMIC_INDICATORS = {
  gdpUsd: "NY.GDP.MKTP.CD",
  gdpPerCapitaUsd: "NY.GDP.PCAP.CD",
  gdpGrowthPct: "NY.GDP.MKTP.KD.ZG",
  inflationPct: "FP.CPI.TOTL.ZG",
  unemploymentPct: "SL.UEM.TOTL.ZS",
  population: "SP.POP.TOTL",
} as const;

function emptyMetric(): MetricValue {
  return { value: null, year: null };
}

function toNumberPair(values: number[] | null | undefined): [number, number] {
  const first = values?.[0] ?? 0;
  return [first, values?.[1] ?? first];
}

function parseApplicantProfile(message: string): ApplicantProfile {
  const lower = message.toLowerCase();
  const goals: MigrationGoal[] = [];
  const goalKeywords: Array<[MigrationGoal, string[]]> = [
    ["study", ["study", "student", "masters", "university", "college"]],
    ["work", ["work", "job", "career", "skilled", "employer"]],
    ["family", ["family", "spouse", "children", "kids", "resettle"]],
    ["investment", ["invest", "business", "founder", "startup"]],
    ["passport", ["passport", "citizenship", "naturalize"]],
    ["fast_pr", ["fast pr", "quick pr", "permanent residence", "pr"]],
    ["low_cost", ["low cost", "cheap", "affordable", "budget"]],
  ];

  for (const [goal, keywords] of goalKeywords) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      goals.push(goal);
    }
  }

  const ageMatch = lower.match(/\b(\d{2})\s*(?:years old|yo|y\/o|age)?\b/);
  const savingsMatch =
    lower.match(/\$\s*(\d+(?:\.\d+)?)\s*(k|thousand|m|million)?/) ??
    lower.match(
      /\b(\d+(?:\.\d+)?)\s*(k|thousand|m|million)\s*(?:usd|dollars|savings|saved|budget|funds)?/,
    ) ??
    lower.match(
      /\b(?:savings|saved|budget|funds)\D{0,12}(\d+(?:\.\d+)?)\s*(k|thousand|m|million)?/,
    ) ??
    null;
  const fromMatch = message.match(
    /\b(?:from|resident of|living in|based in)\s+([A-Z][A-Za-z\s]+?)(?:,|\.|\s+and|\s+with|\s+want|\s+looking|$)/,
  );

  let savingsUsd: number | null = null;
  if (savingsMatch) {
    const raw = Number(savingsMatch[1]);
    const unit = savingsMatch[2];
    savingsUsd = unit === "m" || unit === "million" ? raw * 1_000_000 : raw;
    if (unit === "k" || unit === "thousand") {
      savingsUsd = raw * 1_000;
    }
  }

  return {
    residenceCountry: fromMatch?.[1]?.trim() ?? null,
    citizenshipCountry: null,
    age: ageMatch ? Number(ageMatch[1]) : null,
    savingsUsd,
    goals: goals.length ? goals : ["work", "study"],
    educationLevel: lower.includes("master")
      ? "masters"
      : lower.includes("bachelor")
        ? "bachelors"
        : null,
    occupation: null,
    languageLevel: lower.includes("english") ? "English mentioned" : null,
    movingWithFamily:
      lower.includes("family") ||
      lower.includes("spouse") ||
      lower.includes("children"),
  };
}

async function fetchLatestWorldBankValue(
  iso2: string,
  indicator: string,
): Promise<MetricValue> {
  const response = await fetch(
    `https://api.worldbank.org/v2/country/${iso2}/indicator/${indicator}?format=json&per_page=8`,
    { next: { revalidate: 60 * 60 * 24 } },
  );

  if (!response.ok) return emptyMetric();

  const payload = (await response.json()) as unknown;
  const rows =
    Array.isArray(payload) && Array.isArray(payload[1])
      ? (payload[1] as WorldBankIndicatorRow[])
      : [];
  const latest = rows.find(
    (row) =>
      row.value !== null &&
      row.value !== undefined &&
      Number.isFinite(Number(row.value)),
  );

  if (!latest) return emptyMetric();

  return {
    value: Number(latest.value),
    year: latest.date ?? null,
  };
}

async function fetchIncomeLevel(iso2: string) {
  const response = await fetch(
    `https://api.worldbank.org/v2/country/${iso2}?format=json`,
    { next: { revalidate: 60 * 60 * 24 } },
  );

  if (!response.ok) return null;

  const payload = (await response.json()) as unknown;
  const rows =
    Array.isArray(payload) && Array.isArray(payload[1])
      ? (payload[1] as WorldBankCountryRow[])
      : [];

  return rows[0]?.incomeLevel?.value ?? null;
}

async function fetchEconomicMetrics(
  iso2: string,
): Promise<CountryEconomicMetrics> {
  const [
    incomeLevel,
    gdpUsd,
    gdpPerCapitaUsd,
    gdpGrowthPct,
    inflationPct,
    unemploymentPct,
    population,
  ] = await Promise.all([
    fetchIncomeLevel(iso2).catch(() => null),
    fetchLatestWorldBankValue(iso2, ECONOMIC_INDICATORS.gdpUsd).catch(
      emptyMetric,
    ),
    fetchLatestWorldBankValue(
      iso2,
      ECONOMIC_INDICATORS.gdpPerCapitaUsd,
    ).catch(emptyMetric),
    fetchLatestWorldBankValue(iso2, ECONOMIC_INDICATORS.gdpGrowthPct).catch(
      emptyMetric,
    ),
    fetchLatestWorldBankValue(iso2, ECONOMIC_INDICATORS.inflationPct).catch(
      emptyMetric,
    ),
    fetchLatestWorldBankValue(iso2, ECONOMIC_INDICATORS.unemploymentPct).catch(
      emptyMetric,
    ),
    fetchLatestWorldBankValue(iso2, ECONOMIC_INDICATORS.population).catch(
      emptyMetric,
    ),
  ]);

  return {
    incomeLevel,
    gdpUsd,
    gdpPerCapitaUsd,
    gdpGrowthPct,
    inflationPct,
    unemploymentPct,
    population,
  };
}

async function fetchCountry(candidate: AgentCandidate) {
  const response = await fetch(
    `https://restcountries.com/v3.1/alpha/${candidate.iso2}?fields=name,cca2,cca3,region,subregion,capital,flags,latlng,area`,
    { next: { revalidate: 60 * 60 * 24 } },
  );

  if (!response.ok) {
    return {
      name: candidate.countryName,
      officialName: candidate.countryName,
      iso2: candidate.iso2,
      iso3: candidate.iso3,
      capital: null,
      region: null,
      subregion: null,
      flag: null,
      latitude: 0,
      longitude: 0,
      areaKm2: null,
    };
  }

  const country = (await response.json()) as RestCountry;
  const lat = country.latlng?.[0];
  const lng = country.latlng?.[1];

  return {
    name: country.name?.common ?? candidate.countryName,
    officialName: country.name?.official ?? candidate.countryName,
    iso2: country.cca2 ?? candidate.iso2,
    iso3: country.cca3 ?? candidate.iso3,
    capital: country.capital?.[0] ?? null,
    region: country.region ?? null,
    subregion: country.subregion ?? null,
    flag: country.flags?.svg ?? null,
    latitude: typeof lat === "number" ? lat : 0,
    longitude: typeof lng === "number" ? lng : 0,
    areaKm2: typeof country.area === "number" ? country.area : null,
  };
}

function buildRecommendation({
  candidate,
  country,
  metrics,
}: {
  candidate: AgentCandidate;
  country: CountryRecommendation["country"];
  metrics: CountryEconomicMetrics;
}): CountryRecommendation {
  return {
    id: candidate.id,
    country,
    score: Math.min(99, Math.max(1, Math.round(candidate.score))),
    bestPathway: candidate.defaultPathway,
    pathwayCategory: candidate.pathwayCategory,
    summary: candidate.summary,
    prTimelineMonths: toNumberPair(candidate.prTimelineMonths),
    citizenshipTimelineYears: candidate.citizenshipTimelineYears
      ? toNumberPair(candidate.citizenshipTimelineYears)
      : null,
    minSavingsUsd: candidate.minSavingsUsd,
    documents: candidate.documents.slice(0, 8),
    eligibilityNotes: candidate.eligibilityNotes.slice(0, 8),
    cautions: candidate.cautions.slice(0, 6),
    sources: candidate.sources,
    metrics,
    confidence: "agent_draft",
  };
}

function getConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured.");
  }
  return new ConvexHttpClient(convexUrl);
}

function encodeEvent(event: AgentUiEvent) {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequestBody;
  const message =
    body.message ??
    [...(body.messages ?? [])].reverse().find((item) => item.role === "user")
      ?.content ??
    "";

  if (!message.trim()) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: AgentUiEvent) => controller.enqueue(encodeEvent(event));

      try {
        const profile = parseApplicantProfile(message);
        emit({ type: "profile_extracted", profile });
        emit({
          type: "progress",
          message:
            "Convex agent is searching the web for destination countries that fit this profile...",
        });

        const convex = getConvexClient();
        const candidates = (await convex.action(
          api.immigrationAgent.discoverCountries,
          { prompt: message },
        )) as AgentCandidate[];

        for (const candidate of candidates) {
          emit({
            type: "progress",
            countryId: candidate.id,
            message: `Convex agent selected ${candidate.countryName}; enriching immigration and economic data...`,
          });

          const [country, metrics] = await Promise.all([
            fetchCountry(candidate),
            fetchEconomicMetrics(candidate.iso2).catch(() => ({
              incomeLevel: null,
              gdpUsd: emptyMetric(),
              gdpPerCapitaUsd: emptyMetric(),
              gdpGrowthPct: emptyMetric(),
              inflationPct: emptyMetric(),
              unemploymentPct: emptyMetric(),
              population: emptyMetric(),
            })),
          ]);

          emit({
            type: "country_recommended",
            recommendation: buildRecommendation({
              candidate,
              country,
              metrics,
            }),
          });
        }

        emit({
          type: "research_complete",
          summary: `Convex agent shortlisted ${candidates.length} dynamically researched destinations. Open a marker or sidebar card to inspect pathways, metrics, documents, cautions, and sources.`,
        });
      } catch (error) {
        emit({
          type: "research_error",
          message:
            error instanceof Error
              ? error.message
              : "The Convex research agent failed unexpectedly.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-cache, no-transform",
    },
  });
}
