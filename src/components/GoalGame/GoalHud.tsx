import "./GoalHud.css";
import { useGameStore } from "../../store/gameStore";

// Bottom-centre "how to play" card + reset.
function GoalHud() {
  const resetGame = useGameStore((state) => state.resetGame);

  return (
    <div className="goal-hud">
      <div className="goal-hud__head">
        <span className="goal-hud__ball">⚽</span>
        <span className="goal-hud__title">Kick-about</span>
      </div>

      <p className="goal-hud__hint">
        Click the ball and drag to aim — the further you drag, the harder the
        shot. Release to fire it into a goal.
      </p>

      <button className="goal-hud__reset" onClick={resetGame}>
        Reset match
      </button>
    </div>
  );
}

export default GoalHud;
