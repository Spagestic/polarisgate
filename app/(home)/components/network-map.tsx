"use client";

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
} from "@/components/ui/map";
import { getScoreColor } from "@/lib/scoring";
import type {
  CountryScore,
  DestinationCountry,
  ImmigrationPathway,
} from "@/lib/types";
import { MapControlsCard } from "./map-controls-card";
import { CountryPanel } from "./country-panel";

interface NetworkMapProps {
  countries: DestinationCountry[];
  pathways: ImmigrationPathway[];
  scores: CountryScore[];
  selectedCountryId: string;
  onSelectCountry: (countryId: string) => void;
}

function countryScore(scores: CountryScore[], countryId: string) {
  return scores.find((score) => score.countryId === countryId);
}

export function NetworkMap({
  countries,
  pathways,
  scores,
  selectedCountryId,
  onSelectCountry,
}: NetworkMapProps) {
  const selectedCountry =
    countries.find((country) => country.id === selectedCountryId) ??
    countries[0];
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
