import "./App.css";

import { usePoiStore } from "../store/poiStore";
import { useWeatherStore } from "../store/weatherStore";

function App() {
  const weather = useWeatherStore((state) => state.weather);
  const activePoi = usePoiStore((state) => state.activeName);

  return (
    <>
      <div className="weather-badge">
        {weather ? (
          <>
            <span className="weather-badge__icon">{weather.icon}</span>
            <span>
              <strong className="weather-badge__temp">
                {Math.round(weather.temperature)}°C
              </strong>{" "}
              {weather.label}
            </span>
          </>
        ) : (
          <span>Loading weather…</span>
        )}
      </div>

      <div className="weather-badge">{activePoi}</div>
    </>
  );
}

export default App;
