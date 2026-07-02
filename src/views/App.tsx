import "./App.css";

import WeatherWidget from "../components/WeatherWidget/WeatherWidget";
import PoiInfo from "../components/PoiInfo/PoiInfo";

function App() {
  return (
    <div className="u-grid">
      <WeatherWidget />
      <PoiInfo />
    </div>
  );
}

export default App;
