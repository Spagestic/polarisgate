"use client";

import * as React from "react";
import { Map, MapControls } from "@/components/ui/map";
import { Searchbar } from "@/components/search-bar";
import { useMapFlyTo, type MapFlyToRequest } from "@/hooks/use-map-fly-to";
import { useCountryMapSelection } from "@/hooks/use-country-map-selection";
import { Marker } from "@/app/(home)/components/marker";

function MapFlyToBinder({ request }: { request: MapFlyToRequest | null }) {
  useMapFlyTo(request);
  return null;
}

export function MapPanel() {
  const { markers, flyToRequest, handleSelectCountry } =
    useCountryMapSelection();
  const popupResetKey = flyToRequest?.key ?? 0;

  return (
    <>
      <div className="border-border/40 bg-background/70 absolute top-3.5 left-4 z-20 flex items-center gap-3 rounded-lg border backdrop-blur-sm">
        <Searchbar className="" onSelect={handleSelectCountry} />
      </div>

      <Map center={[18, 18]} zoom={1.5} projection={{ type: "globe" }}>
        <MapFlyToBinder request={flyToRequest} />
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            id={marker.id}
            country={marker.country}
            longitude={marker.longitude}
            latitude={marker.latitude}
            selectedAt={marker.selectedAt}
            popupResetKey={popupResetKey}
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
