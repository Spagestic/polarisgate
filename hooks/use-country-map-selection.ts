"use client";

import * as React from "react";
import type { SearchResult } from "@/components/search-bar";
import type { MapFlyToRequest } from "@/hooks/use-map-fly-to";
import { flyToZoomForAreaKm2 } from "@/lib/map/fly-to-zoom";

export type CountryMarker = {
  id: string;
  selectedAt: number;
  country: SearchResult;
  longitude: number;
  latitude: number;
};

type UseCountryMapSelectionOptions = {
  maxMarkers?: number;
};

export function useCountryMapSelection(
  options?: UseCountryMapSelectionOptions,
) {
  const maxMarkers = options?.maxMarkers ?? 8;
  const [flyToRequest, setFlyToRequest] =
    React.useState<MapFlyToRequest | null>(null);
  const [markers, setMarkers] = React.useState<CountryMarker[]>([]);
  const [openMarkerId, setOpenMarkerId] = React.useState<string | null>(
    null,
  );

  const handleSelectCountry = React.useCallback(
    (country: SearchResult) => {
      const lon = country.longitude;
      const lat = country.latitude;
      if (lon == null || lat == null) return;

      const markerId =
        country.iso3 ?? country.iso2 ?? country.name ?? `${lon}:${lat}`;
      const selectedAt = Date.now();
      // Close any open popup immediately; reopen after fly animation finishes.
      setOpenMarkerId(null);

      setMarkers((prev) => {
        const next: CountryMarker = {
          id: markerId,
          selectedAt,
          country,
          longitude: lon,
          latitude: lat,
        };
        const withoutCurrent = prev.filter((marker) => marker.id !== markerId);
        return [next, ...withoutCurrent].slice(0, maxMarkers);
      });

      setFlyToRequest((prev) => ({
        longitude: lon,
        latitude: lat,
        zoom: flyToZoomForAreaKm2(country.areaKm2),
        markerId,
        key: (prev?.key ?? 0) + 1,
      }));
    },
    [maxMarkers],
  );

  const handleFlyComplete = React.useCallback((request: MapFlyToRequest) => {
    if (!request.markerId) return;
    setOpenMarkerId(request.markerId);
  }, []);

  return {
    markers,
    openMarkerId,
    flyToRequest,
    handleSelectCountry,
    handleFlyComplete,
  };
}
