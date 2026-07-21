// Shared domain types used across more than one module. Types that only ever
// appear inside a single file stay declared there, next to their use.

// [[west, south], [east, north]] — a lng/lat rectangle used for the map's
// maxBounds and for fencing the pan/play areas.
export type LngLatBounds = [[number, number], [number, number]];

// A scatter-model entry consumed by both PlantInstances (the layer manager)
// and PlantLayer (the per-model instancer).
export interface PlantConfig {
  url: string;
  nodeName: string;
  count: number;
  weight?: string; // weight-map to scatter on; defaults to nodeName
}
