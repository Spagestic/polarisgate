import { describe, expect, test } from "bun:test";
import { destinationCountries, immigrationPathways } from "../app/(home)/data";
import { defaultProfile, scoreDestinations } from "./scoring";

describe("scoreDestinations", () => {
  test("returns a ranked score for every seeded destination", () => {
    const scores = scoreDestinations(
      defaultProfile,
      destinationCountries,
      immigrationPathways,
    );

    expect(scores).toHaveLength(destinationCountries.length);
    expect(scores[0].score).toBeGreaterThanOrEqual(scores.at(-1)?.score ?? 0);
    expect(scores[0].bestPathwayId).toBeTruthy();
  });

  test("rewards study goals when a study-to-PR pathway exists", () => {
    const scores = scoreDestinations(
      {
        ...defaultProfile,
        goals: ["study"],
        savingsUsd: 45000,
        age: 24,
      },
      destinationCountries,
      immigrationPathways,
    );
    const canada = scores.find((score) => score.countryId === "canada");

    expect(canada?.matchedPathwayIds).toContain("ca-study-pgwp");
  });
});
