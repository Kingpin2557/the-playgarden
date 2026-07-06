import "./App.css";

import WeatherWidget from "../components/weatherwidget/WeatherWidget";
import PoiInfo from "../components/PoiInfo/PoiInfo";
import Onboarding from "../components/Onboarding/Onboarding";
import GoalScore from "../components/GoalGame/GoalScore";
import GoalHud from "../components/GoalGame/GoalHud";
import { useAppStore } from "../store/appStore";
import { usePoiStore } from "../store/poiStore";
import { useGameStore } from "../store/gameStore";

function App() {
  const onboarded = useAppStore((state) => state.onboarded);
  const activeName = usePoiStore((state) => state.activeName);
  const playing = useGameStore((state) => state.playing);
  const inGoals = activeName === "Goals";

  return (
    <>
      {onboarded && (
        <div className="u-grid">
          <WeatherWidget />
          {inGoals && playing && <GoalScore />}
          <PoiInfo />
          {inGoals && <GoalHud />}
        </div>
      )}
      <Onboarding />
    </>
  );
}

export default App;
