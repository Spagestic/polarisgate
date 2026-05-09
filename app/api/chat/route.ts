import FirecrawlApp from "@mendable/firecrawl-js";
import type {
  AgentUiEvent,
  ApplicantProfile,
  CountryRecommendation,
  MigrationGoal,
  RecommendationSource,
} from "@/lib/immigration/types";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  message?: string;
  messages?: ChatMessage[];
};

type KnownCountry = CountryRecommendation["country"] & {
  id: string;
  officialImmigrationUrl: string;
  defaultPathway: string;
  pathwayCategory: CountryRecommendation["pathwayCategory"];
  prTimelineMonths: [number, number];
  citizenshipTimelineYears: [number, number] | null;
  minSavingsUsd: number;
  regionFit: MigrationGoal[];
};

type RetrievedSource = RecommendationSource & {
  snippet: string;
};

type RecommendationDraft = Partial<
  Pick<
    CountryRecommendation,
    | "score"
    | "bestPathway"
    | "summary"
    | "documents"
    | "eligibilityNotes"
    | "cautions"
    | "minSavingsUsd"
  >
>;

const KNOWN_COUNTRIES: KnownCountry[] = [
  {
    id: "canada",
    name: "Canada",
    officialName: "Canada",
    iso2: "CA",
    iso3: "CAN",
    capital: "Ottawa",
    region: "Americas",
    subregion: "North America",
    flag: "https://flagcdn.com/ca.svg",
    latitude: 56.1304,
    longitude: -106.3468,
    areaKm2: 9984670,
    officialImmigrationUrl: "https://www.canada.ca/en/immigration-refugees-citizenship.html",
    defaultPathway: "Express Entry or study-to-PGWP-to-PR",
    pathwayCategory: "skilled_worker",
    prTimelineMonths: [6, 36],
    citizenshipTimelineYears: [3, 5],
    minSavingsUsd: 11000,
    regionFit: ["study", "work", "fast_pr", "passport"],
  },
  {
    id: "australia",
    name: "Australia",
    officialName: "Commonwealth of Australia",
    iso2: "AU",
    iso3: "AUS",
    capital: "Canberra",
    region: "Oceania",
    subregion: "Australia and New Zealand",
    flag: "https://flagcdn.com/au.svg",
    latitude: -25.2744,
    longitude: 133.7751,
    areaKm2: 7692024,
    officialImmigrationUrl: "https://immi.homeaffairs.gov.au/",
    defaultPathway: "Skilled Independent, state nominated, or study-to-skilled route",
    pathwayCategory: "skilled_worker",
    prTimelineMonths: [12, 48],
    citizenshipTimelineYears: [4, 6],
    minSavingsUsd: 15000,
    regionFit: ["study", "work", "passport"],
  },
  {
    id: "germany",
    name: "Germany",
    officialName: "Federal Republic of Germany",
    iso2: "DE",
    iso3: "DEU",
    capital: "Berlin",
    region: "Europe",
    subregion: "Western Europe",
    flag: "https://flagcdn.com/de.svg",
    latitude: 51.1657,
    longitude: 10.4515,
    areaKm2: 357588,
    officialImmigrationUrl: "https://www.make-it-in-germany.com/en/",
    defaultPathway: "EU Blue Card, skilled worker visa, or study-to-work route",
    pathwayCategory: "employer_sponsored",
    prTimelineMonths: [21, 60],
    citizenshipTimelineYears: [5, 8],
    minSavingsUsd: 12000,
    regionFit: ["study", "work", "low_cost", "passport"],
  },
  {
    id: "new-zealand",
    name: "New Zealand",
    officialName: "New Zealand",
    iso2: "NZ",
    iso3: "NZL",
    capital: "Wellington",
    region: "Oceania",
    subregion: "Australia and New Zealand",
    flag: "https://flagcdn.com/nz.svg",
    latitude: -40.9006,
    longitude: 174.886,
    areaKm2: 270467,
    officialImmigrationUrl: "https://www.immigration.govt.nz/",
    defaultPathway: "Skilled Migrant Category or accredited employer route",
    pathwayCategory: "skilled_worker",
    prTimelineMonths: [12, 48],
    citizenshipTimelineYears: [5, 6],
    minSavingsUsd: 10000,
    regionFit: ["work", "family", "passport"],
  },
  {
    id: "portugal",
    name: "Portugal",
    officialName: "Portuguese Republic",
    iso2: "PT",
    iso3: "PRT",
    capital: "Lisbon",
    region: "Europe",
    subregion: "Southern Europe",
    flag: "https://flagcdn.com/pt.svg",
    latitude: 39.3999,
    longitude: -8.2245,
    areaKm2: 92090,
    officialImmigrationUrl: "https://aima.gov.pt/",
    defaultPathway: "Study, work, or residence route followed by long-term residence",
    pathwayCategory: "study_to_pr",
    prTimelineMonths: [24, 60],
    citizenshipTimelineYears: [5, 7],
    minSavingsUsd: 9000,
    regionFit: ["study", "low_cost", "passport", "family"],
  },
  {
    id: "united-kingdom",
    name: "United Kingdom",
    officialName: "United Kingdom of Great Britain and Northern Ireland",
    iso2: "GB",
    iso3: "GBR",
    capital: "London",
    region: "Europe",
    subregion: "Northern Europe",
    flag: "https://flagcdn.com/gb.svg",
    latitude: 55.3781,
    longitude: -3.436,
    areaKm2: 242900,
    officialImmigrationUrl: "https://www.gov.uk/browse/visas-immigration",
    defaultPathway: "Skilled Worker visa to settlement or graduate-to-skilled route",
    pathwayCategory: "employer_sponsored",
    prTimelineMonths: [60, 72],
    citizenshipTimelineYears: [6, 7],
    minSavingsUsd: 8000,
    regionFit: ["study", "work", "passport"],
  },
  {
    id: "ireland",
    name: "Ireland",
    officialName: "Ireland",
    iso2: "IE",
    iso3: "IRL",
    capital: "Dublin",
    region: "Europe",
    subregion: "Northern Europe",
    flag: "https://flagcdn.com/ie.svg",
    latitude: 53.1424,
    longitude: -7.6921,
    areaKm2: 70273,
    officialImmigrationUrl: "https://www.irishimmigration.ie/",
    defaultPathway: "Critical Skills Employment Permit to long-term residence",
    pathwayCategory: "employer_sponsored",
    prTimelineMonths: [24, 60],
    citizenshipTimelineYears: [5, 6],
    minSavingsUsd: 12000,
    regionFit: ["work", "study", "passport"],
  },
];

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
  const fromMatch = message.match(/\b(?:from|resident of|living in|based in)\s+([A-Z][A-Za-z\s]+?)(?:,|\.|\s+and|\s+with|\s+want|\s+looking|$)/);

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
    movingWithFamily: lower.includes("family") || lower.includes("spouse") || lower.includes("children"),
  };
}

function scoreCountry(country: KnownCountry, profile: ApplicantProfile) {
  const goalFit = profile.goals.filter((goal) =>
    country.regionFit.includes(goal),
  ).length;
  const savings = profile.savingsUsd ?? 20_000;
  const affordability = savings >= country.minSavingsUsd ? 20 : -10;
  const ageBoost =
    typeof profile.age === "number" && profile.age >= 22 && profile.age <= 35
      ? 10
      : 0;

  return Math.min(96, Math.max(62, 66 + goalFit * 8 + affordability + ageBoost));
}

function chooseCountries(profile: ApplicantProfile, message: string) {
  const lower = message.toLowerCase();
  const explicitlyMentioned = KNOWN_COUNTRIES.filter((country) =>
    lower.includes(country.name.toLowerCase()),
  );

  const ranked = [...KNOWN_COUNTRIES].sort(
    (a, b) => scoreCountry(b, profile) - scoreCountry(a, profile),
  );

  const merged = [...explicitlyMentioned, ...ranked].filter(
    (country, index, all) =>
      all.findIndex((item) => item.id === country.id) === index,
  );

  return merged.slice(0, 5);
}

function normalizeFirecrawlResults(payload: unknown): RetrievedSource[] {
  const records =
    typeof payload === "object" && payload !== null && "data" in payload
      ? (payload as { data?: unknown }).data
      : payload;

  if (!Array.isArray(records)) return [];

  return records
    .map((record): RetrievedSource | null => {
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
        title: typeof item.title === "string" ? item.title : publisherFromUrl(item.url),
        url: item.url,
        publisher: publisherFromUrl(item.url),
        snippet:
          typeof item.markdown === "string"
            ? item.markdown.slice(0, 1800)
            : typeof item.description === "string"
              ? item.description
              : typeof item.content === "string"
                ? item.content.slice(0, 1800)
                : "",
      };
    })
    .filter((source): source is RetrievedSource => source !== null)
    .slice(0, 4);
}

async function retrieveSources(country: KnownCountry, profile: ApplicantProfile) {
  if (!process.env.FIRECRAWL_API_KEY) {
    return [
      {
        title: `${country.name} official immigration portal`,
        url: country.officialImmigrationUrl,
        publisher: publisherFromUrl(country.officialImmigrationUrl),
        snippet: "Set FIRECRAWL_API_KEY to retrieve live official-source snippets.",
      },
    ];
  }

  const firecrawl = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY,
  });
  const query = [
    country.name,
    "official immigration permanent residence requirements",
    profile.goals.join(" "),
  ].join(" ");
  const result = await firecrawl.search(query, {
    limit: 4,
    sources: ["web"],
    timeout: 30000,
    scrapeOptions: {
      formats: ["markdown"],
      onlyMainContent: true,
    },
  });
  const sources = normalizeFirecrawlResults(result);

  return sources.length
    ? sources
    : [
        {
          title: `${country.name} official immigration portal`,
          url: country.officialImmigrationUrl,
          publisher: publisherFromUrl(country.officialImmigrationUrl),
          snippet: "Fallback official source.",
        },
      ];
}

async function extractRecommendationDraft({
  country,
  profile,
  sources,
}: {
  country: KnownCountry;
  profile: ApplicantProfile;
  sources: RetrievedSource[];
}): Promise<RecommendationDraft> {
  if (!process.env.MISTRAL_API_KEY) return {};

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You extract immigration-route summaries from official-source snippets. Return strict JSON only. Avoid legal certainty and include caveats.",
        },
        {
          role: "user",
          content: JSON.stringify({
            today: new Date().toISOString().slice(0, 10),
            applicantProfile: profile,
            country: {
              name: country.name,
              defaultPathway: country.defaultPathway,
              officialImmigrationUrl: country.officialImmigrationUrl,
            },
            sources,
            schema: {
              score: "number 0-100",
              bestPathway: "string",
              summary: "2 sentence string",
              minSavingsUsd: "number or null",
              documents: "string[]",
              eligibilityNotes: "string[]",
              cautions: "string[]",
            },
          }),
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) return {};

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return {};

  try {
    return JSON.parse(sanitizeJson(content)) as RecommendationDraft;
  } catch {
    return {};
  }
}

function buildRecommendation({
  country,
  profile,
  sources,
  draft,
}: {
  country: KnownCountry;
  profile: ApplicantProfile;
  sources: RetrievedSource[];
  draft: RecommendationDraft;
}): CountryRecommendation {
  const sourceLinks = sources.map(({ title, url, publisher }) => ({
    title,
    url,
    publisher,
  }));
  const score =
    typeof draft.score === "number"
      ? Math.min(99, Math.max(1, Math.round(draft.score)))
      : scoreCountry(country, profile);
  const recommendationCountry: CountryRecommendation["country"] = {
    name: country.name,
    officialName: country.officialName,
    iso2: country.iso2,
    iso3: country.iso3,
    capital: country.capital,
    region: country.region,
    subregion: country.subregion,
    flag: country.flag,
    latitude: country.latitude,
    longitude: country.longitude,
    areaKm2: country.areaKm2,
  };

  return {
    id: country.id,
    country: recommendationCountry,
    score,
    bestPathway: draft.bestPathway || country.defaultPathway,
    pathwayCategory: country.pathwayCategory,
    summary:
      draft.summary ||
      `${country.name} is a plausible fit for ${profile.goals.join(", ")} goals through ${country.defaultPathway}. Treat this as a starting shortlist and verify requirements against the linked official sources.`,
    prTimelineMonths: country.prTimelineMonths,
    citizenshipTimelineYears: country.citizenshipTimelineYears,
    minSavingsUsd:
      typeof draft.minSavingsUsd === "number"
        ? draft.minSavingsUsd
        : country.minSavingsUsd,
    documents: draft.documents?.length
      ? draft.documents.slice(0, 8)
      : [
          "Valid passport",
          "Proof of funds",
          "Education credentials",
          "Language test results if required",
          "Police clearance",
          "Medical examination",
        ],
    eligibilityNotes: draft.eligibilityNotes?.length
      ? draft.eligibilityNotes.slice(0, 8)
      : [
          `Best initial route: ${country.defaultPathway}.`,
          "Exact eligibility depends on occupation, education, language scores, and current quota settings.",
        ],
    cautions: draft.cautions?.length
      ? draft.cautions.slice(0, 6)
      : [
          "Immigration rules change frequently; verify dates and forms before applying.",
          "This is not legal advice.",
        ],
    sources: sourceLinks,
    confidence:
      process.env.FIRECRAWL_API_KEY && process.env.MISTRAL_API_KEY
        ? "agent_draft"
        : "seeded",
  };
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

        const countries = chooseCountries(profile, message);

        for (const country of countries) {
          emit({
            type: "progress",
            countryId: country.id,
            message: `Researching ${country.name} official immigration sources...`,
          });

          const sources = await retrieveSources(country, profile).catch(() => [
            {
              title: `${country.name} official immigration portal`,
              url: country.officialImmigrationUrl,
              publisher: publisherFromUrl(country.officialImmigrationUrl),
              snippet: "Live retrieval failed; using official portal fallback.",
            },
          ]);
          const draft = await extractRecommendationDraft({
            country,
            profile,
            sources,
          }).catch(() => ({}));

          emit({
            type: "country_recommended",
            recommendation: buildRecommendation({
              country,
              profile,
              sources,
              draft,
            }),
          });
        }

        emit({
          type: "research_complete",
          summary: `Shortlisted ${countries.length} destinations. Open a marker or sidebar card to inspect pathways, documents, cautions, and sources.`,
        });
      } catch (error) {
        emit({
          type: "research_error",
          message:
            error instanceof Error
              ? error.message
              : "The research agent failed unexpectedly.",
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
