import "./App.css";

import WeatherWidget from "../components/WeatherWidget/WeatherWidget";
import PoiInfo from "../components/PoiInfo/PoiInfo";
import Onboarding from "../components/Onboarding/Onboarding";
import GoalScore from "../components/GoalGame/GoalScore";
import GoalHud from "../components/GoalGame/GoalHud";
import { useAppStore } from "../store/appStore";
import { usePoiStore } from "../store/poiStore";

function App() {
  const onboarded = useAppStore((state) => state.onboarded);
  const activeName = usePoiStore((state) => state.activeName);
  const inGoals = activeName === "Goals";

  return (
    <>
      {onboarded && (
        <div className="u-grid">
          <WeatherWidget />
          {inGoals && <GoalScore />}
          <PoiInfo />
          {inGoals && <GoalHud />}
        </div>
      )}
      <Onboarding />
    </>
  );
}

export default App;
