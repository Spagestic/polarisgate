"use client";

import { MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import type { SearchResult } from "@/components/search-bar";
import { Globe2, MapPin, Ruler } from "lucide-react";
import type { CountryRecommendation } from "@/lib/immigration/types";

type CountryRichMarkerProps = {
  id: string;
  country: SearchResult;
  longitude: number;
  latitude: number;
  selectedAt: number;
  forceOpen: boolean;
  popupResetKey: number;
  recommendation?: CountryRecommendation;
  onSelect?: (id: string) => void;
  onShowDetails?: (id: string) => void;
};

export function Marker({
  id,
  country,
  longitude,
  latitude,
  selectedAt,
  forceOpen,
  popupResetKey,
  recommendation,
  onSelect,
  onShowDetails,
}: CountryRichMarkerProps) {
  const countryLabel = country.name ?? "Country";
  const timeline = recommendation
    ? `${recommendation.prTimelineMonths[0]}-${recommendation.prTimelineMonths[1]} mo to PR`
    : null;

  return (
    <MapMarker key={id} longitude={longitude} latitude={latitude}>
      <MarkerContent>
        <button
          type="button"
          onClick={() => onSelect?.(id)}
          className={
            recommendation
              ? "size-6 cursor-pointer rounded-full border-2 border-white bg-emerald-500 shadow-lg ring-4 ring-emerald-500/20 transition-transform hover:scale-110"
              : "size-5 cursor-pointer rounded-full border-2 border-white bg-rose-500 shadow-lg transition-transform hover:scale-110"
          }
          aria-label={`Select ${countryLabel}`}
        />
      </MarkerContent>

      <MarkerPopup
        key={`${id}-${popupResetKey}`}
        className="w-72 p-0"
        forceOpen={forceOpen}
      >
        <div className="from-muted to-muted/60 flex h-28 items-center justify-center overflow-hidden rounded-t-md bg-linear-to-br">
          {country.flag ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={country.flag}
              alt={`${countryLabel} flag`}
              className="h-full w-full object-cover"
            />
          ) : (
            <Globe2 className="text-muted-foreground size-8" />
          )}
        </div>

        <div className="space-y-2 p-3">
          <div>
            <h3 className="text-foreground leading-tight font-semibold">
              {countryLabel}
            </h3>
          </div>

          {recommendation ? (
            <div className="rounded-md border bg-emerald-50/80 p-2 text-xs text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">
                  {recommendation.score}% fit
                </span>
                {timeline ? <span>{timeline}</span> : null}
              </div>
              <p className="mt-1 line-clamp-2">{recommendation.bestPathway}</p>
            </div>
          ) : null}

          <div className="text-muted-foreground grid gap-1 text-sm">
            {country.capital ? (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                <span>Capital: {country.capital}</span>
              </div>
            ) : null}

            {country.areaKm2 ? (
              <div className="flex items-center gap-1.5">
                <Ruler className="size-3.5" />
                <span>Area: {country.areaKm2.toLocaleString()} km²</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs">
            {country.iso2 ? (
              <span className="bg-muted rounded px-2 py-1 font-medium uppercase">
                {country.iso2}
              </span>
            ) : null}
            {country.iso3 ? (
              <span className="bg-muted rounded px-2 py-1 font-medium uppercase">
                {country.iso3}
              </span>
            ) : null}
            {!recommendation ? (
              <span className="text-muted-foreground ml-auto">
                {new Date(selectedAt).toLocaleTimeString()}
              </span>
            ) : null}
          </div>

          {recommendation ? (
            <button
              type="button"
              onClick={() => onShowDetails?.(id)}
              className="bg-foreground text-background hover:bg-foreground/90 w-full rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              Show details
            </button>
          ) : null}
        </div>
      </MarkerPopup>
    </MapMarker>
  );
}
