import "./App.css";

import WeatherWidget from "../components/weatherwidget/WeatherWidget";
import PoiInfo from "../components/PoiInfo/PoiInfo";
import NavGuide from "../components/NavGuide/NavGuide";

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
