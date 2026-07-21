import { create } from "zustand";

import type { LngLatBounds } from "../types";

// The pan box in scene metres: centre (x, z) and its width/length.
export interface BoxArea {
  x: number;
  z: number;
  width: number;
  length: number;
}

interface MapStore {
  panBounds: LngLatBounds | null;
  boxArea: BoxArea | null;
  setPanBounds: (bounds: LngLatBounds) => void;
  setBoxArea: (area: BoxArea) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  panBounds: null,
  boxArea: null,
  setPanBounds: (panBounds) => set({ panBounds }),
  setBoxArea: (boxArea) => set({ boxArea }),
}));
