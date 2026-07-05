import { create } from "zustand";

interface AppStore {
  entered: boolean;
  audioEnabled: boolean;
  onboarded: boolean;
  hintPoi: string | null; // name of the PoI the onboarding is highlighting
  enter: (audioEnabled: boolean) => void;
  finishOnboarding: () => void;
  setHintPoi: (name: string | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  entered: false,
  audioEnabled: false,
  onboarded: false,
  hintPoi: null,
  enter: (audioEnabled) => set({ entered: true, audioEnabled }),
  finishOnboarding: () => set({ onboarded: true, hintPoi: null }),
  setHintPoi: (hintPoi) => set({ hintPoi }),
}));
