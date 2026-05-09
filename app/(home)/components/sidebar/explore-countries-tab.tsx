"use client";

import {
  ArrowLeftIcon,
  ClockIcon,
  EarthIcon,
  ExternalLinkIcon,
  FileCheckIcon,
  Loader2Icon,
  WalletIcon,
} from "lucide-react";

import type {
  CountryRecommendation,
  ResearchStatus,
} from "@/lib/immigration/types";

type ExploreCountriesTabProps = {
  recommendations: CountryRecommendation[];
  selectedCountryId?: string | null;
  researchStatus: ResearchStatus;
  progressMessage?: string | null;
  error?: string | null;
  onSelectCountry: (countryId: string | null) => void;
};

function formatCurrency(value: number | null) {
  if (typeof value !== "number") return "Varies";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTimeline(months: [number, number]) {
  return `${months[0]}-${months[1]} months`;
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-5 text-center">
      <div className="bg-muted mb-3 flex size-12 items-center justify-center rounded-full">
        <EarthIcon className="text-muted-foreground size-5" />
      </div>
      <h3 className="text-sm font-semibold">Find your migration shortlist</h3>
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        Describe your country of residence, age, savings, and goals. The agent
        will research pathways and place recommended countries on the map.
      </p>
    </div>
  );
}

function RecommendationCard({
  recommendation,
  selected,
  onSelect,
}: {
  recommendation: CountryRecommendation;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border p-3 text-left transition-colors ${
        selected
          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
          : "hover:bg-muted/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{recommendation.country.name}</p>
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
            {recommendation.bestPathway}
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {recommendation.score}%
        </span>
      </div>
      <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="size-3.5" />
          {formatTimeline(recommendation.prTimelineMonths)}
        </span>
        <span className="inline-flex items-center gap-1">
          <WalletIcon className="size-3.5" />
          {formatCurrency(recommendation.minSavingsUsd)}
        </span>
      </div>
    </button>
  );
}

function RecommendationDetails({
  recommendation,
  onBack,
}: {
  recommendation: CountryRecommendation;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeftIcon className="size-4" />
        Back to recommendations
      </button>

      <div>
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {recommendation.country.region ?? "Destination"}
        </p>
        <h2 className="mt-1 text-xl font-semibold">
          {recommendation.country.name}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {recommendation.summary}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border p-3">
          <p className="text-muted-foreground text-xs">Fit score</p>
          <p className="mt-1 text-lg font-semibold">{recommendation.score}%</p>
        </div>
        <div className="rounded-xl border p-3">
          <p className="text-muted-foreground text-xs">PR timeline</p>
          <p className="mt-1 text-lg font-semibold">
            {formatTimeline(recommendation.prTimelineMonths)}
          </p>
        </div>
      </div>

      <section>
        <h3 className="text-sm font-semibold">Best pathway</h3>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          {recommendation.bestPathway}
        </p>
      </section>

      <section>
        <h3 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold">
          <FileCheckIcon className="size-4" />
          Documents to prepare
        </h3>
        <div className="space-y-1.5">
          {recommendation.documents.map((document) => (
            <div
              key={document}
              className="bg-muted/60 rounded-lg px-3 py-2 text-sm"
            >
              {document}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold">Eligibility notes</h3>
        <ul className="text-muted-foreground mt-2 space-y-2 text-sm leading-6">
          {recommendation.eligibilityNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold">Cautions</h3>
        <ul className="text-muted-foreground mt-2 space-y-2 text-sm leading-6">
          {recommendation.cautions.map((caution) => (
            <li key={caution}>{caution}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold">Sources</h3>
        <div className="mt-2 space-y-2">
          {recommendation.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="hover:bg-muted flex items-start gap-2 rounded-lg border p-2 text-sm"
            >
              <ExternalLinkIcon className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
              <span>
                <span className="line-clamp-2">{source.title}</span>
                <span className="text-muted-foreground mt-0.5 block text-xs">
                  {source.publisher}
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ExploreCountriesTab({
  recommendations,
  selectedCountryId,
  researchStatus,
  progressMessage,
  error,
  onSelectCountry,
}: ExploreCountriesTabProps) {
  const selectedRecommendation = recommendations.find(
    (recommendation) => recommendation.id === selectedCountryId,
  );

  if (selectedRecommendation) {
    return (
      <div className="space-y-4 p-4">
        <RecommendationDetails
          recommendation={selectedRecommendation}
          onBack={() => onSelectCountry(null)}
        />
      </div>
    );
  }

  if (recommendations.length === 0 && researchStatus === "idle") {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4 p-4">
      {researchStatus === "researching" ? (
        <div className="bg-muted/40 rounded-xl border p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Loader2Icon className="size-4 animate-spin" />
            Finding destinations
          </div>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {progressMessage ?? "Finding official sources and ranking routes..."}
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border p-3 text-sm">
          {error}
        </div>
      ) : null}

      {recommendations.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recommended destinations</h3>
            <span className="text-muted-foreground text-xs">
              {recommendations.length} found
            </span>
          </div>
          <div className="space-y-2">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                selected={recommendation.id === selectedCountryId}
                onSelect={() => onSelectCountry(recommendation.id)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
