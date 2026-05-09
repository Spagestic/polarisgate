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
  const primaryReason = recommendation?.summary.split(/[.!?]/)[0]?.trim();
  const caution = recommendation?.cautions[0];
  const confidenceLabel =
    recommendation?.confidence === "agent_draft"
      ? "Live research"
      : recommendation?.confidence === "verified"
        ? "Verified"
        : "Seeded";

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
          {recommendation ? (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-foreground leading-tight font-semibold">
                    {countryLabel}
                  </h3>
                </div>
                <span className="text-muted-foreground text-xs font-medium">
                  {timeline}
                </span>
              </div>

              <div>
                <p className="text-foreground line-clamp-1 text-sm font-medium">
                  {recommendation.bestPathway}
                </p>
                {primaryReason ? (
                  <p className="text-muted-foreground mt-1 line-clamp-3 text-xs leading-5">
                    {primaryReason}.
                  </p>
                ) : null}
              </div>

              {caution ? (
                <p className="text-muted-foreground border-border border-t pt-2 text-xs leading-5">
                  Note: {caution}
                </p>
              ) : null}
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-foreground leading-tight font-semibold">
                  {countryLabel}
                </h3>
              </div>

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
                <span className="text-muted-foreground ml-auto">
                  {new Date(selectedAt).toLocaleTimeString()}
                </span>
              </div>
            </>
          )}
        </div>
      </MarkerPopup>
    </MapMarker>
  );
}
