import "./GoalHud.css";
import { useGameStore } from "../../store/gameStore";

function GoalHud() {
  const playing = useGameStore((state) => state.playing);
  const startGame = useGameStore((state) => state.startGame);
  const stopGame = useGameStore((state) => state.stopGame);
  const resetGame = useGameStore((state) => state.resetGame);

  return (
    <div className="c-goal-hud">
      <div className="c-goal-hud__head">
        <span className="c-goal-hud__ball">⚽</span>
        <span className="c-goal-hud__title">Kick-about</span>
      </div>

      <p className="c-goal-hud__hint">
        {playing
          ? "Click the ball and drag to aim — the further you drag, the harder the shot. Release to fire it into a goal."
          : "Ready for a kick-about? Press start, or just click the ball, to play."}
      </p>

      {playing ? (
        <div className="c-goal-hud__buttons">
          <button
            className="c-goal-hud__btn c-goal-hud__btn--ghost"
            onClick={resetGame}
          >
            Reset game
          </button>
          <button className="c-goal-hud__btn" onClick={stopGame}>
            Stop game
          </button>
        </div>
      ) : (
        <button className="c-goal-hud__btn" onClick={startGame}>
          Start game
        </button>
      )}
    </div>
  );
}

export default GoalHud;
