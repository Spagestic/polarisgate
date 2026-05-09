"use client";

import * as React from "react";
import { Map, MapControls, useMap } from "@/components/ui/map";
import { Searchbar, type SearchResult } from "@/components/search-bar";
import { flyToZoomForAreaKm2 } from "@/lib/map/fly-to-zoom";

export type FlyToRequest = {
  longitude: number;
  latitude: number;
  zoom: number;
  key: number;
};

function FlyToCountry({
  flyToRequest,
}: {
  flyToRequest: FlyToRequest | null;
}) {
  const { map, isLoaded } = useMap();

  React.useEffect(() => {
    if (!map || !isLoaded || !flyToRequest) return;

    map.flyTo({
      center: [flyToRequest.longitude, flyToRequest.latitude],
      zoom: flyToRequest.zoom,
      duration: 1500,
      essential: true,
    });
  }, [map, isLoaded, flyToRequest]);

  return null;
}

export function MapPanel() {
  const [flyToRequest, setFlyToRequest] = React.useState<FlyToRequest | null>(
    null,
  );

  const handleSelectCountry = React.useCallback((country: SearchResult) => {
    const lon = country.longitude;
    const lat = country.latitude;
    if (lon == null || lat == null) return;

    setFlyToRequest((prev) => ({
      longitude: lon,
      latitude: lat,
      zoom: flyToZoomForAreaKm2(country.areaKm2),
      key: (prev?.key ?? 0) + 1,
    }));
  }, []);

  return (
    <>
      <div className="border-border/40 bg-background/70 absolute top-3.5 left-4 z-20 flex items-center gap-3 rounded-lg border backdrop-blur-sm">
        <Searchbar className="" onSelect={handleSelectCountry} />
      </div>

      <Map center={[18, 18]} zoom={1.5} projection={{ type: "globe" }}>
        <FlyToCountry flyToRequest={flyToRequest} />
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
