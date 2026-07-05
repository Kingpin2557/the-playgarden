import { create } from "zustand";

// Where the camera flies to for a PoI, plus that PoI's own framing.
export interface FocusTarget {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

interface PoiStore {
  focus: FocusTarget | null;
  activeName: string | null;
  setFocus: (name: string, focus: FocusTarget) => void;
  clear: () => void;
}

export const usePoiStore = create<PoiStore>((set) => ({
  focus: null,
  activeName: null,
  setFocus: (name, focus) => set({ focus, activeName: name }),
  clear: () => set({ focus: null, activeName: null }),
}));
