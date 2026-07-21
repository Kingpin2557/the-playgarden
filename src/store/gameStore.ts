import { create } from "zustand";

import type { LngLatBounds } from "../types";

type GoalPlacement = { x: number; z: number; rotation: number } | null;

type PlayBounds = LngLatBounds | null;

interface GameStore {
  left: number;
  right: number;
  resetToken: number;
  aiming: boolean;
  playing: boolean;
  goalPlacement: GoalPlacement;
  playBounds: PlayBounds;
  scoreLeft: () => void;
  scoreRight: () => void;
  resetGame: () => void;
  startGame: () => void;
  stopGame: () => void;
  setAiming: (value: boolean) => void;
  setGoalPlacement: (placement: GoalPlacement) => void;
  setPlayBounds: (bounds: PlayBounds) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  left: 0,
  right: 0,
  resetToken: 0,
  aiming: false,
  playing: false,
  goalPlacement: null,
  playBounds: null,
  scoreLeft: () =>
    set((s) => ({ left: s.left + 1, resetToken: s.resetToken + 1 })),
  scoreRight: () =>
    set((s) => ({ right: s.right + 1, resetToken: s.resetToken + 1 })),
  resetGame: () =>
    set((s) => ({ left: 0, right: 0, resetToken: s.resetToken + 1 })),
  startGame: () =>
    set((s) => ({ playing: true, left: 0, right: 0, resetToken: s.resetToken + 1 })),
  stopGame: () => set({ playing: false, aiming: false }),
  setAiming: (value) => set({ aiming: value }),
  setGoalPlacement: (placement) => set({ goalPlacement: placement }),
  setPlayBounds: (bounds) => set({ playBounds: bounds }),
}));
