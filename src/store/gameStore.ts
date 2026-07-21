import { create } from "zustand";

import type { LngLatBounds } from "../types";

// Live world placement of the visible goal model (scene metres + Y rotation in
// degrees). PointOfInterest publishes it so the physics goals sit exactly on top
// of what you see, even while you tune the "Goal" Leva folder.
type GoalPlacement = { x: number; z: number; rotation: number } | null;

// The lng/lat rectangle of the play-box walls, used as the map's pan limit
// while the game is running.
type PlayBounds = LngLatBounds | null;

// State for the goals mini-game. `playing` gates the whole game UI: before it's
// true the visitor just sees the pitch + a Start/Play button; once playing, the
// scoreboard + Stop/Reset controls appear and the PoI back button hides.
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
  // Reset: ball back to origin, score back to 0 - 0.
  resetGame: () =>
    set((s) => ({ left: 0, right: 0, resetToken: s.resetToken + 1 })),
  // Start: begin a fresh game (0 - 0, ball at origin).
  startGame: () =>
    set((s) => ({ playing: true, left: 0, right: 0, resetToken: s.resetToken + 1 })),
  // Stop: leave the game; the UI hides and the back button returns.
  stopGame: () => set({ playing: false, aiming: false }),
  setAiming: (value) => set({ aiming: value }),
  setGoalPlacement: (placement) => set({ goalPlacement: placement }),
  setPlayBounds: (bounds) => set({ playBounds: bounds }),
}));
