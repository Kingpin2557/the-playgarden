import { create } from "zustand";

interface AppStore {
  entered: boolean;
  audioEnabled: boolean;
  enter: (audioEnabled: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  entered: false,
  audioEnabled: false,
  enter: (audioEnabled) => set({ entered: true, audioEnabled }),
}));
