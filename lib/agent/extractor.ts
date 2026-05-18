import type { ImmigrationPathway } from "../types";
import { generateGemmaJson, parseModelJson } from "./gemini";
import type { RetrievedSource } from "./retriever";

type AgentPathwayDraft = Omit<
  ImmigrationPathway,
  "id" | "countryId" | "sourceLinks" | "confidence" | "lastReviewed"
>;

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function fallbackDraft(countryName: string): AgentPathwayDraft {
  return {
    name: `${countryName} official pathway research`,
    category: "skilled_worker",
    summary:
      "Official sources were retrieved, but AI extraction is not configured. Review the linked source and rerun with GEMINI_API_KEY for structured pathway extraction.",
    prTimelineMonths: [24, 60],
    citizenshipTimelineYears: null,
    minSavingsUsd: 10000,
    minEducationLevel: null,
    minLanguageLevel: null,
    idealAgeMax: null,
    familyFriendly: true,
    documents: ["Passport", "Application forms", "Proof of funds", "Identity documents"],
    eligibilityNotes: ["Configure GEMINI_API_KEY to extract country-specific requirements."],
  };
}

function normalizeDraft(
  draft: Partial<AgentPathwayDraft>,
  countryName: string,
): AgentPathwayDraft {
  const fallback = fallbackDraft(countryName);
  return {
    name: draft.name || fallback.name,
    category: draft.category || fallback.category,
    summary: draft.summary || fallback.summary,
    prTimelineMonths: draft.prTimelineMonths || fallback.prTimelineMonths,
    citizenshipTimelineYears:
      draft.citizenshipTimelineYears ?? fallback.citizenshipTimelineYears,
    minSavingsUsd: draft.minSavingsUsd ?? fallback.minSavingsUsd,
    minEducationLevel: draft.minEducationLevel ?? fallback.minEducationLevel,
    minLanguageLevel: draft.minLanguageLevel ?? fallback.minLanguageLevel,
    idealAgeMax: draft.idealAgeMax ?? fallback.idealAgeMax,
    familyFriendly: draft.familyFriendly ?? fallback.familyFriendly,
    documents: draft.documents?.length ? draft.documents : fallback.documents,
    eligibilityNotes: draft.eligibilityNotes?.length
      ? draft.eligibilityNotes
      : fallback.eligibilityNotes,
  };
}

export async function extractPathwayDraft({
  countryId,
  countryName,
  sources,
  pathwayFocus,
}: {
  countryId: string;
  countryName: string;
  sources: RetrievedSource[];
  pathwayFocus?: string;
}): Promise<ImmigrationPathway> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  let draft = fallbackDraft(countryName);

  if (geminiApiKey) {
    try {
      const content = await generateGemmaJson({
        systemInstruction:
          "Extract immigration pathway information only from the supplied official-source snippets. Return strict JSON with no markdown.",
        userContent: JSON.stringify({
          countryName,
          pathwayFocus:
            pathwayFocus ??
            "permanent residence routes, timelines, documents, and eligibility",
          schema: {
            name: "string",
            category:
              "skilled_worker | study_to_pr | employer_sponsored | family | investment",
            summary: "string",
            prTimelineMonths: "[number, number]",
            citizenshipTimelineYears: "[number, number] or null",
            minSavingsUsd: "number",
            minEducationLevel:
              "secondary | diploma | bachelors | masters | doctorate | null",
            minLanguageLevel:
              "basic | intermediate | advanced | native | null",
            idealAgeMax: "number or null",
            familyFriendly: "boolean",
            documents: "string[]",
            eligibilityNotes: "string[]",
          },
          sources,
        }),
        temperature: 0.1,
      });
      draft = normalizeDraft(
        parseModelJson<Partial<AgentPathwayDraft>>(content),
        countryName,
      );
    } catch (error) {
      console.warn("Gemma pathway extraction failed", {
        countryName,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    id: `${countryId}-agent-${draft.category}`,
    countryId,
    ...draft,
    sourceLinks: sources.map((source) => ({
      title: source.title,
      url: source.url,
      publisher: source.publisher,
    })),
    lastReviewed: todayIsoDate(),
    confidence: geminiApiKey ? "agent_draft" : "seeded",
  };
}
