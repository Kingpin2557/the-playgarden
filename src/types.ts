export type LngLatBounds = [[number, number], [number, number]];

export interface PlantConfig {
  url: string;
  nodeName: string;
  count: number;
  weight?: string;
}
