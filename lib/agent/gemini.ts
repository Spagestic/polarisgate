/** Gemma 4 model for the Gemma 4 Developer Hackathon (Track A: AI Agent). */
export const GEMMA_MODEL = "gemma-4-31b-it";

const GENERATE_CONTENT_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMMA_MODEL}:generateContent`;

type JsonSchema = Record<string, unknown>;

type GenerateGemmaJsonInput = {
  systemInstruction: string;
  userContent: string;
  temperature?: number;
  responseSchema?: JsonSchema;
};

export function parseModelJson<T>(text: string): T {
  const trimmed = text.trim();

  const attempts = [
    trimmed,
    trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim(),
    (() => {
      const start = trimmed.indexOf("{");
      const end = trimmed.lastIndexOf("}");
      return start !== -1 && end > start
        ? trimmed.slice(start, end + 1)
        : undefined;
    })(),
  ].filter((value): value is string => typeof value === "string" && value.length > 0);

  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // try next extraction strategy
    }
  }

  throw new Error(
    `Model response was not valid JSON. Preview: ${trimmed.slice(0, 240)}`,
  );
}

function textFromGenerateContentPayload(payload: {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string; thought?: boolean }>;
    };
  }>;
}) {
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  const answerParts = parts.filter((part) => part.thought !== true && part.text);
  const selected = answerParts.length > 0 ? answerParts : parts;

  return selected
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

export async function generateGemmaJson({
  systemInstruction,
  userContent,
  temperature = 0.2,
  responseSchema,
}: GenerateGemmaJsonInput): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY must be set. Get a key at https://aistudio.google.com/apikey",
    );
  }

  const generationConfig: Record<string, unknown> = {
    temperature,
    responseMimeType: "application/json",
  };
  if (responseSchema) {
    generationConfig.responseSchema = responseSchema;
  }

  const response = await fetch(GENERATE_CONTENT_URL, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userContent }],
        },
      ],
      generationConfig,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Gemma generateContent failed (${response.status}): ${errorBody.slice(0, 500)}`,
    );
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string; thought?: boolean }> };
    }>;
  };

  const text = textFromGenerateContentPayload(payload);
  if (!text) {
    throw new Error("Gemma generateContent returned no text.");
  }

  return text;
}

/** JSON schema for country-discovery structured output (Gemini API responseSchema). */
export const countryDiscoveryResponseSchema: JsonSchema = {
  type: "object",
  properties: {
    countries: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          countryName: { type: "string" },
          iso2: { type: "string" },
          iso3: { type: "string" },
          officialImmigrationUrl: { type: "string" },
          defaultPathway: { type: "string" },
          pathwayCategory: {
            type: "string",
            enum: [
              "skilled_worker",
              "study_to_pr",
              "employer_sponsored",
              "family",
              "investment",
            ],
          },
          prTimelineMonths: {
            type: "array",
            items: { type: "number" },
          },
          citizenshipTimelineYears: {
            type: "array",
            items: { type: "number" },
            nullable: true,
          },
          minSavingsUsd: { type: "number", nullable: true },
          score: { type: "number" },
          summary: { type: "string" },
          documents: { type: "array", items: { type: "string" } },
          eligibilityNotes: { type: "array", items: { type: "string" } },
          cautions: { type: "array", items: { type: "string" } },
          sourceUrls: { type: "array", items: { type: "string" } },
        },
        required: [
          "id",
          "countryName",
          "iso2",
          "iso3",
          "officialImmigrationUrl",
          "defaultPathway",
          "pathwayCategory",
          "prTimelineMonths",
          "score",
          "summary",
          "documents",
          "eligibilityNotes",
          "cautions",
          "sourceUrls",
        ],
      },
    },
  },
  required: ["countries"],
};
