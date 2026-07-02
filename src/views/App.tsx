import "./App.css";

import WeatherWidget from "../components/weatherwidget/WeatherWidget";
import PoiInfo from "../components/poiinfo/PoiInfo";
import NavGuide from "../components/navguide/NavGuide";

function App() {
  return (
    <>
      <div className="u-grid">
        <WeatherWidget />
        <PoiInfo />
      </div>
      <NavGuide />
    </>
  );
}

export default App;
