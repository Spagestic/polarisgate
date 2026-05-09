"use client";

import { ArrowRightLeftIcon } from "lucide-react";
import type {
  CountryRecommendation,
  MetricValue,
} from "@/lib/immigration/types";

type CompareCountriesTabProps = {
  recommendations: CountryRecommendation[];
};

function formatCompactNumber(metric?: MetricValue) {
  if (typeof metric?.value !== "number") return "N/A";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(metric.value);
}

function formatCurrency(metric?: MetricValue) {
  if (typeof metric?.value !== "number") return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(metric.value);
}

function formatPercent(metric?: MetricValue) {
  if (typeof metric?.value !== "number") return "N/A";
  return `${metric.value.toFixed(1)}%`;
}

function formatTimeline(months: [number, number]) {
  return `${months[0]}-${months[1]} mo`;
}

export function CompareCountriesTab({
  recommendations,
}: CompareCountriesTabProps) {
  if (recommendations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-5 text-center">
        <div className="bg-muted mb-3 flex size-12 items-center justify-center rounded-full">
          <ArrowRightLeftIcon className="text-muted-foreground size-5" />
        </div>
        <h3 className="text-sm font-semibold">Compare countries</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Run a search first. Recommended destinations will appear here with
          side-by-side economic and migration metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {recommendations.map((recommendation) => {
        const metrics = recommendation.metrics;

        return (
          <div key={recommendation.id} className="rounded-xl border p-3">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  {recommendation.country.name}
                </p>
                <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                  {recommendation.bestPathway}
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {recommendation.score}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Metric
                label="PR timeline"
                value={formatTimeline(recommendation.prTimelineMonths)}
              />
              <Metric
                label="Min savings"
                value={
                  recommendation.minSavingsUsd
                    ? formatCurrency({
                        value: recommendation.minSavingsUsd,
                        year: null,
                      })
                    : "N/A"
                }
              />
              <Metric
                label="GDP"
                value={formatCurrency(metrics?.gdpUsd)}
                year={metrics?.gdpUsd.year}
              />
              <Metric
                label="GDP / capita"
                value={formatCurrency(metrics?.gdpPerCapitaUsd)}
                year={metrics?.gdpPerCapitaUsd.year}
              />
              <Metric
                label="GDP growth"
                value={formatPercent(metrics?.gdpGrowthPct)}
                year={metrics?.gdpGrowthPct.year}
              />
              <Metric
                label="Inflation"
                value={formatPercent(metrics?.inflationPct)}
                year={metrics?.inflationPct.year}
              />
              <Metric
                label="Unemployment"
                value={formatPercent(metrics?.unemploymentPct)}
                year={metrics?.unemploymentPct.year}
              />
              <Metric
                label="Population"
                value={formatCompactNumber(metrics?.population)}
                year={metrics?.population.year}
              />
            </div>

            {metrics?.incomeLevel ? (
              <p className="text-muted-foreground mt-3 text-xs">
                Income level: {metrics.incomeLevel}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function Metric({
  label,
  value,
  year,
}: {
  label: string;
  value: string;
  year?: string | null;
}) {
  return (
    <div className="bg-muted/50 rounded-lg p-2">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
      {year ? <p className="text-muted-foreground mt-0.5">{year}</p> : null}
    </div>
  );
}
