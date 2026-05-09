"use client";

import * as React from "react";
import { Map, MapControls } from "@/components/ui/map";
import { Searchbar } from "@/components/search-bar";
import { useMapFlyTo, type MapFlyToRequest } from "@/hooks/use-map-fly-to";
import { useCountryMapSelection } from "@/hooks/use-country-map-selection";
import { Marker } from "@/app/(home)/components/marker";
import { flyToZoomForAreaKm2 } from "@/lib/map/fly-to-zoom";
import type { CountryRecommendation } from "@/lib/immigration/types";

function MapFlyToBinder({
  request,
  onComplete,
}: {
  request: MapFlyToRequest | null;
  onComplete: (request: MapFlyToRequest) => void;
}) {
  useMapFlyTo(request, { onComplete });
  return null;
}

export type MapPanelProps = {
  recommendations?: CountryRecommendation[];
  selectedCountryId?: string | null;
  onSelectRecommendation?: (countryId: string) => void;
  onShowDetails?: (countryId: string) => void;
};

export function MapPanel({
  recommendations = [],
  selectedCountryId,
  onSelectRecommendation,
  onShowDetails,
}: MapPanelProps) {
  const { markers, openMarkerId, flyToRequest, handleSelectCountry, handleFlyComplete } =
    useCountryMapSelection();
  const selectedRecommendation = React.useMemo(
    () =>
      recommendations.find(
        (recommendation) => recommendation.id === selectedCountryId,
      ) ?? null,
    [recommendations, selectedCountryId],
  );
  const agentFlyToRequest = React.useMemo<MapFlyToRequest | null>(() => {
    if (!selectedRecommendation) return null;

    return {
      longitude: selectedRecommendation.country.longitude,
      latitude: selectedRecommendation.country.latitude,
      zoom: flyToZoomForAreaKm2(selectedRecommendation.country.areaKm2),
      markerId: selectedRecommendation.id,
      key:
        recommendations.findIndex(
          (recommendation) => recommendation.id === selectedRecommendation.id,
        ) + 1,
    };
  }, [recommendations, selectedRecommendation]);
  const popupResetKey = flyToRequest?.key ?? agentFlyToRequest?.key ?? 0;

  const handleSelectRecommendation = React.useCallback(
    (countryId: string) => {
      const recommendation = recommendations.find((item) => item.id === countryId);
      if (!recommendation) return;

      onSelectRecommendation?.(countryId);
    },
    [onSelectRecommendation, recommendations],
  );

  return (
    <>
      <div className="border-border/40 bg-background/70 absolute top-3.5 left-4 z-20 flex items-center gap-3 rounded-lg border backdrop-blur-sm">
        <Searchbar className="" onSelect={handleSelectCountry} />
      </div>

      <Map center={[18, 18]} zoom={1.5} projection={{ type: "globe" }}>
        <MapFlyToBinder request={flyToRequest} onComplete={handleFlyComplete} />
        <MapFlyToBinder request={agentFlyToRequest} onComplete={() => undefined} />
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            id={marker.id}
            country={marker.country}
            longitude={marker.longitude}
            latitude={marker.latitude}
            selectedAt={marker.selectedAt}
            forceOpen={marker.id === openMarkerId}
            popupResetKey={popupResetKey}
          />
        ))}
        {recommendations.map((recommendation) => (
          <Marker
            key={recommendation.id}
            id={recommendation.id}
            country={recommendation.country}
            longitude={recommendation.country.longitude}
            latitude={recommendation.country.latitude}
            selectedAt={0}
            forceOpen={recommendation.id === selectedCountryId}
            popupResetKey={popupResetKey}
            recommendation={recommendation}
            onSelect={handleSelectRecommendation}
            onShowDetails={onShowDetails}
          />
        ))}
        <MapControls
          position="bottom-right"
          showZoom
          showLocate
          showFullscreen
        />
      </Map>
    </>
  );
}
