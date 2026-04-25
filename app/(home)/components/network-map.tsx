"use client";

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
} from "@/components/ui/map";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getScoreColor } from "@/lib/scoring";
import type {
  CountryScore,
  DestinationCountry,
  ImmigrationPathway,
} from "@/lib/types";

interface NetworkMapProps {
  countries: DestinationCountry[];
  pathways: ImmigrationPathway[];
  scores: CountryScore[];
  selectedCountryId: string;
  onSelectCountry: (countryId: string) => void;
}

function MapControlsCard() {
  return (
    <div className="border-border/40 bg-background/70 absolute top-4 left-4 z-20 flex items-center gap-3 rounded-lg border px-2.5 py-1.5 backdrop-blur-sm">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4!" />
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: "#22c55e" }}
          />
          <span>Strong</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: "#f59e0b" }}
          />
          <span>Possible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: "#ef4444" }}
          />
          <span>Difficult</span>
        </div>
      </div>
    </div>
  );
}

function formatTimeline(months: [number, number]) {
  const [min, max] = months;
  return `${Math.round(min / 12)}-${Math.round(max / 12)} years`;
}

function countryScore(scores: CountryScore[], countryId: string) {
  return scores.find((score) => score.countryId === countryId);
}

function PathwayCard({ pathway }: { pathway: ImmigrationPathway }) {
  return (
    <Card size="sm" className="bg-background/80">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{pathway.name}</CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">
              {pathway.summary}
            </p>
          </div>
          <Badge variant="outline">{pathway.category.replaceAll("_", " ")}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border p-2">
            <p className="text-muted-foreground">PR timeline</p>
            <p className="font-medium">{formatTimeline(pathway.prTimelineMonths)}</p>
          </div>
          <div className="rounded-lg border p-2">
            <p className="text-muted-foreground">Funds estimate</p>
            <p className="font-medium">
              ${pathway.minSavingsUsd.toLocaleString()}+
            </p>
          </div>
        </div>
        <div>
          <p className="mb-1 font-medium">Documents to prepare</p>
          <div className="flex flex-wrap gap-1">
            {pathway.documents.slice(0, 5).map((document) => (
              <Badge key={document} variant="secondary">
                {document}
              </Badge>
            ))}
          </div>
        </div>
        <a
          href={pathway.sourceLinks[0]?.url}
          target="_blank"
          rel="noreferrer"
          className="text-primary inline-flex text-xs font-medium hover:underline"
        >
          Official source: {pathway.sourceLinks[0]?.publisher}
        </a>
      </CardContent>
    </Card>
  );
}

function CountryPanel({
  country,
  score,
  pathways,
}: {
  country: DestinationCountry;
  score: CountryScore | undefined;
  pathways: ImmigrationPathway[];
}) {
  const bestPathway = pathways.find(
    (pathway) => pathway.id === score?.bestPathwayId,
  );
  const visiblePathways = bestPathway
    ? [bestPathway, ...pathways.filter((pathway) => pathway.id !== bestPathway.id)]
    : pathways;

  return (
    <div className="absolute top-4 right-4 z-20 hidden w-[380px] max-w-[calc(100%-2rem)] space-y-3 lg:block">
      <Card className="bg-background/85 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-xs">{country.region}</p>
              <CardTitle className="text-xl">{country.name}</CardTitle>
            </div>
            <Badge>{score?.score ?? 0}/100</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium">{score?.summary}</span>
              <span className="text-muted-foreground">Fit score</span>
            </div>
            <Progress value={score?.score ?? 0} />
          </div>
          <div className="space-y-2 text-xs">
            {score?.reasons.map((reason) => (
              <p key={reason} className="rounded-lg bg-muted/60 px-2.5 py-2">
                {reason}
              </p>
            ))}
            {score?.cautions.map((caution) => (
              <p
                key={caution}
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-2 text-amber-700 dark:text-amber-300"
              >
                {caution}
              </p>
            ))}
          </div>
          <Button variant="outline" size="sm" render={<a href={country.officialImmigrationUrl} target="_blank" rel="noreferrer" />}>
            Open official immigration site
          </Button>
        </CardContent>
      </Card>
      <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
        {visiblePathways.map((pathway) => (
          <PathwayCard key={pathway.id} pathway={pathway} />
        ))}
      </div>
    </div>
  );
}

export function NetworkMap({
  countries,
  pathways,
  scores,
  selectedCountryId,
  onSelectCountry,
}: NetworkMapProps) {
  const selectedCountry =
    countries.find((country) => country.id === selectedCountryId) ?? countries[0];
  const selectedScore = countryScore(scores, selectedCountry.id);
  const selectedPathways = pathways.filter(
    (pathway) => pathway.countryId === selectedCountry.id,
  );

  return (
    <div className="relative h-full">
      <MapControlsCard />

      <Map center={[18, 18]} zoom={1.45} projection={{ type: "globe" }}>
        <MapControls showCompass showFullscreen />

        {countries.map((country) => {
          const score = countryScore(scores, country.id);
          const color = getScoreColor(score?.score ?? 0);
          const selected = country.id === selectedCountry.id;
          return (
            <MapMarker
              key={country.id}
              longitude={country.longitude}
              latitude={country.latitude}
              onClick={() => onSelectCountry(country.id)}
            >
              <MarkerContent>
                <div
                  className="flex size-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-lg transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    transform: selected ? "scale(1.18)" : undefined,
                  }}
                >
                  {country.iso2}
                </div>
              </MarkerContent>
              <MarkerTooltip
                offset={18}
                className="bg-background text-foreground border px-2.5 py-1.5"
              >
                <p className="font-medium">{country.name}</p>
                <p className="text-muted-foreground mt-1">
                  {score?.summary ?? "Needs research"}
                  <span className="mx-1">-</span>
                  {score?.score ?? 0}/100
                </p>
              </MarkerTooltip>
            </MapMarker>
          );
        })}
      </Map>

      <CountryPanel
        country={selectedCountry}
        score={selectedScore}
        pathways={selectedPathways}
      />
    </div>
  );
}
