"use client";

import {
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";
import type { SearchResult } from "@/components/search-bar";
import { Globe2, MapPin, Ruler } from "lucide-react";

type CountryRichMarkerProps = {
  id: string;
  country: SearchResult;
  longitude: number;
  latitude: number;
  selectedAt: number;
  forceOpen: boolean;
  popupResetKey: number;
};

export function Marker({
  id,
  country,
  longitude,
  latitude,
  selectedAt,
  forceOpen,
  popupResetKey,
}: CountryRichMarkerProps) {
  const countryLabel = country.name ?? "Country";

  return (
    <MapMarker key={id} longitude={longitude} latitude={latitude}>
      <MarkerContent>
        <div className="size-5 cursor-pointer rounded-full border-2 border-white bg-rose-500 shadow-lg transition-transform hover:scale-110" />
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
            <p className="text-muted-foreground pb-0.5 text-[11px] font-medium tracking-wide uppercase">
              {country.region ?? "Region"}
            </p>
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
        </div>
      </MarkerPopup>
    </MapMarker>
  );
}
