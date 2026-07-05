import { create } from "zustand";

// Tiny state for the goals mini-game. There is a goal at each end of the pitch
// (left and right), each with its own tally. resetToken is a counter the ball
// watches: bumping it tells the physics ball to teleport back to its start spot.
interface GameStore {
  left: number;
  right: number;
  resetToken: number;
  scoreLeft: () => void;
  scoreRight: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  left: 0,
  right: 0,
  resetToken: 0,
  scoreLeft: () =>
    set((s) => ({ left: s.left + 1, resetToken: s.resetToken + 1 })),
  scoreRight: () =>
    set((s) => ({ right: s.right + 1, resetToken: s.resetToken + 1 })),
  resetGame: () =>
    set((s) => ({ left: 0, right: 0, resetToken: s.resetToken + 1 })),
}));
