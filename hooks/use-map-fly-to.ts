"use client";

import * as React from "react";
import { useMap } from "@/components/ui/map";

export type MapFlyToRequest = {
  longitude: number;
  latitude: number;
  zoom: number;
  /** Increment to animate again to the same place */
  key: number;
};

export type UseMapFlyToOptions = {
  durationMs?: number;
};

/** Animated `flyTo` when `request` changes. Call only inside `<Map>` (uses `useMap`). */
export function useMapFlyTo(
  request: MapFlyToRequest | null,
  options?: UseMapFlyToOptions,
): void {
  const { map, isLoaded } = useMap();
  const durationMs = options?.durationMs ?? 1500;

  React.useEffect(() => {
    if (!map || !isLoaded || !request) return;

    map.flyTo({
      center: [request.longitude, request.latitude],
      zoom: request.zoom,
      duration: durationMs,
      essential: true,
    });
  }, [map, isLoaded, request, durationMs]);
}
