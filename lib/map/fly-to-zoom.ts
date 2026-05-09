/**
 * Picks a MapLibre zoom level from country land area so large states stay wider
 * and small ones fill more of the viewport. Areas are REST Countries-style km².
 */
export function flyToZoomForAreaKm2(areaKm2: number | null | undefined): number {
  if (areaKm2 == null || !Number.isFinite(areaKm2) || areaKm2 <= 0) {
    return 4.5;
  }

  const minZ = 2.25;
  const maxZ = 9.75;
  // log10 scale: big countries pull zoom down, small countries push it up
  const zoom = 13.15 - 1.52 * Math.log10(areaKm2);
  return Math.min(maxZ, Math.max(minZ, zoom));
}
