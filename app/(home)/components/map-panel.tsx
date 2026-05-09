"use client";

import * as React from "react";
import { Map, MapControls } from "@/components/ui/map";
import { Searchbar, type SearchResult } from "@/components/search-bar";
import {
  useMapFlyTo,
  type MapFlyToRequest,
} from "@/hooks/use-map-fly-to";
import { flyToZoomForAreaKm2 } from "@/lib/map/fly-to-zoom";

function MapFlyToBinder({ request }: { request: MapFlyToRequest | null }) {
  useMapFlyTo(request);
  return null;
}

export function MapPanel() {
  const [flyToRequest, setFlyToRequest] = React.useState<MapFlyToRequest | null>(
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
        <MapFlyToBinder request={flyToRequest} />
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
