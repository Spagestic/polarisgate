"use client";

import * as React from "react";
import { useMap } from "@/components/ui/map";

export type MapFlyToRequest = {
  longitude: number;
  latitude: number;
  zoom: number;
  markerId?: string;
  /** Increment to animate again to the same place */
  key: number;
};

export type UseMapFlyToOptions = {
  durationMs?: number;
  onComplete?: (request: MapFlyToRequest) => void;
};

/** Animated `flyTo` when `request` changes. Call only inside `<Map>` (uses `useMap`). */
export function useMapFlyTo(
  request: MapFlyToRequest | null,
  options?: UseMapFlyToOptions,
): void {
  const { map, isLoaded } = useMap();
  const durationMs = options?.durationMs ?? 1500;
  const onComplete = options?.onComplete;

  React.useEffect(() => {
    if (!map || !isLoaded || !request) return;
    const handleMoveEnd = () => {
      onComplete?.(request);
    };
    map.once("moveend", handleMoveEnd);

    map.flyTo({
      center: [request.longitude, request.latitude],
      zoom: request.zoom,
      duration: durationMs,
      essential: true,
    });
    return () => {
      map.off("moveend", handleMoveEnd);
    };
  }, [map, isLoaded, request, durationMs, onComplete]);
}
