import "./GoalScore.css";
import { useGameStore } from "../../store/gameStore";

function GoalScore() {
  const left = useGameStore((state) => state.left);
  const right = useGameStore((state) => state.right);

  return (
    <div className="c-goal-score">
      <span className="c-goal-score__side">Left</span>
      <span className="c-goal-score__value">{left}</span>
      <span className="c-goal-score__dash">–</span>
      <span className="c-goal-score__value">{right}</span>
      <span className="c-goal-score__side">Right</span>
    </div>
  );
}

export default GoalScore;
