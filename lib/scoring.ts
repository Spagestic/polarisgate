import type {
  CountryScore,
  DestinationCountry,
  EducationLevel,
  ImmigrationPathway,
  ImmigrationProfile,
  LanguageLevel,
  MigrationGoal,
  PathwayCategory,
  ScoreBreakdown,
} from "@/lib/types";

const educationRank: Record<EducationLevel, number> = {
  secondary: 1,
  diploma: 2,
  bachelors: 3,
  masters: 4,
  doctorate: 5,
};

const languageRank: Record<LanguageLevel, number> = {
  basic: 1,
  intermediate: 2,
  advanced: 3,
  native: 4,
};

const goalCategoryMap: Record<MigrationGoal, PathwayCategory[]> = {
  study: ["study_to_pr"],
  work: ["skilled_worker", "employer_sponsored"],
  family: ["family"],
  investment: ["investment"],
  passport: ["skilled_worker", "study_to_pr", "employer_sponsored"],
  fast_pr: ["skilled_worker", "employer_sponsored"],
  low_cost: ["skilled_worker", "study_to_pr", "employer_sponsored"],
};

export const defaultProfile: ImmigrationProfile = {
  residenceCountry: "India",
  citizenshipCountry: "India",
  age: 28,
  savingsUsd: 25000,
  educationLevel: "bachelors",
  occupation: "Software engineer",
  languageLevel: "advanced",
  goals: ["work", "fast_pr"],
  movingWithFamily: false,
  targetCountryId: null,
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function scoreGoalFit(pathway: ImmigrationPathway, goals: MigrationGoal[]) {
  if (goals.length === 0) return 45;
  const matches = goals.filter((goal) =>
    goalCategoryMap[goal].includes(pathway.category),
  );
  return clamp((matches.length / goals.length) * 100);
}

function scoreAffordability(
  country: DestinationCountry,
  pathway: ImmigrationPathway,
  profile: ImmigrationProfile,
) {
  const savingsRatio =
    pathway.minSavingsUsd === 0
      ? 1
      : profile.savingsUsd / pathway.minSavingsUsd;
  const pathwayScore = clamp(savingsRatio * 85);
  const costPenalty = {
    low: 0,
    medium: 6,
    high: 14,
    very_high: 22,
  }[country.costLevel];

  return clamp(pathwayScore - costPenalty);
}

function scoreEligibility(
  pathway: ImmigrationPathway,
  profile: ImmigrationProfile,
) {
  const scores: number[] = [];

  if (pathway.minEducationLevel) {
    scores.push(
      educationRank[profile.educationLevel] >=
        educationRank[pathway.minEducationLevel]
        ? 100
        : 35,
    );
  }

  if (pathway.minLanguageLevel) {
    scores.push(
      languageRank[profile.languageLevel] >=
        languageRank[pathway.minLanguageLevel]
        ? 100
        : 40,
    );
  }

  if (pathway.idealAgeMax) {
    scores.push(profile.age <= pathway.idealAgeMax ? 100 : 65);
  }

  return scores.length === 0 ? 70 : average(scores);
}

function scoreTimeline(pathway: ImmigrationPathway, goals: MigrationGoal[]) {
  const averageMonths = average(pathway.prTimelineMonths);
  const baseline = goals.includes("fast_pr") ? 36 : 60;
  return clamp(100 - Math.max(0, averageMonths - baseline) * 1.8);
}

function scoreFamilyFit(
  pathway: ImmigrationPathway,
  profile: ImmigrationProfile,
) {
  if (!profile.movingWithFamily) return 75;
  return pathway.familyFriendly ? 100 : 35;
}

function summarizeScore(score: number) {
  if (score >= 80) return "Strong fit";
  if (score >= 65) return "Promising";
  if (score >= 50) return "Possible with tradeoffs";
  return "Difficult based on this profile";
}

function buildReasons(
  country: DestinationCountry,
  pathway: ImmigrationPathway,
  breakdown: ScoreBreakdown,
  profile: ImmigrationProfile,
) {
  const reasons = [
    `${pathway.name} is the best initial route for ${country.name}.`,
  ];
  const cautions: string[] = [];

  if (breakdown.goalFit >= 70) {
    reasons.push("The pathway aligns with your selected migration goals.");
  }
  if (breakdown.affordability >= 70) {
    reasons.push("Your savings are within range for the seeded funds estimate.");
  } else {
    cautions.push("Savings may be below the estimated funds or cost buffer.");
  }
  if (breakdown.eligibility >= 80) {
    reasons.push("Education, language, and age signals look competitive.");
  } else {
    cautions.push("Eligibility depends on points, occupation lists, or sponsorship.");
  }
  if (profile.movingWithFamily && !pathway.familyFriendly) {
    cautions.push("This route may be harder if dependants are moving with you.");
  }

  return { reasons, cautions };
}

export function scoreDestinations(
  profile: ImmigrationProfile,
  countries: DestinationCountry[],
  pathways: ImmigrationPathway[],
): CountryScore[] {
  return countries
    .map((country) => {
      const countryPathways = pathways.filter(
        (pathway) => pathway.countryId === country.id,
      );
      const pathwayScores = countryPathways.map((pathway) => {
        const breakdown: ScoreBreakdown = {
          goalFit: scoreGoalFit(pathway, profile.goals),
          affordability: scoreAffordability(country, pathway, profile),
          eligibility: scoreEligibility(pathway, profile),
          timeline: scoreTimeline(pathway, profile.goals),
          familyFit: scoreFamilyFit(pathway, profile),
        };
        const score =
          breakdown.goalFit * 0.25 +
          breakdown.affordability * 0.2 +
          breakdown.eligibility * 0.3 +
          breakdown.timeline * 0.15 +
          breakdown.familyFit * 0.1;

        return { pathway, breakdown, score: Math.round(score) };
      });

      const best = pathwayScores.sort((a, b) => b.score - a.score)[0];
      if (!best) {
        return {
          countryId: country.id,
          score: 0,
          bestPathwayId: null,
          matchedPathwayIds: [],
          summary: "No seeded pathways yet",
          reasons: [],
          cautions: ["Research is needed before this country can be scored."],
          breakdown: {
            goalFit: 0,
            affordability: 0,
            eligibility: 0,
            timeline: 0,
            familyFit: 0,
          },
        };
      }

      const { reasons, cautions } = buildReasons(
        country,
        best.pathway,
        best.breakdown,
        profile,
      );

      return {
        countryId: country.id,
        score: best.score,
        bestPathwayId: best.pathway.id,
        matchedPathwayIds: pathwayScores
          .filter(({ score }) => score >= 50)
          .map(({ pathway }) => pathway.id),
        summary: summarizeScore(best.score),
        reasons,
        cautions,
        breakdown: best.breakdown,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function getScoreColor(score: number) {
  if (score >= 80) return "#22c55e";
  if (score >= 65) return "#84cc16";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}
