import { describe, expect, test } from "bun:test";
import { extractPathwayDraft } from "./extractor";

describe("extractPathwayDraft", () => {
  test("returns a safe fallback draft without an AI key", async () => {
    const previousApiKey = process.env.MISTRAL_API_KEY;
    delete process.env.MISTRAL_API_KEY;

    try {
      const pathway = await extractPathwayDraft({
        countryId: "testland",
        countryName: "Testland",
        sources: [
          {
            title: "Official immigration",
            url: "https://immigration.example.gov",
            publisher: "Example Government",
            snippet: "Permanent residence requirements.",
          },
        ],
      });

      expect(pathway.countryId).toBe("testland");
      expect(pathway.sourceLinks[0].publisher).toBe("Example Government");
      expect(pathway.documents.length).toBeGreaterThan(0);
    } finally {
      if (previousApiKey === undefined) {
        delete process.env.MISTRAL_API_KEY;
      } else {
        process.env.MISTRAL_API_KEY = previousApiKey;
      }
    }
  });
});
