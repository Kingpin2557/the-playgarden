import "./App.css";

import WeatherWidget from "../components/WeatherWidget/WeatherWidget";
import PoiInfo from "../components/PoiInfo/PoiInfo";
import Onboarding from "../components/Onboarding/Onboarding";
import { useAppStore } from "../store/appStore";

function App() {
  const onboarded = useAppStore((state) => state.onboarded);

  return (
    <>
      {onboarded && (
        <div className="u-grid">
          <WeatherWidget />
          <PoiInfo />
        </div>
      )}
      <Onboarding />
    </>
  );
}

export default App;
