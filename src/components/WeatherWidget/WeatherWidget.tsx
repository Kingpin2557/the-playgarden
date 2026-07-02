import type { ReactNode } from "react";

import "./WeatherWidget.css";
import { useWeatherStore } from "../../store/weatherStore";

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="weather-widget__stat">
      <span className="weather-widget__stat-label">{label}</span>
      <span className="weather-widget__stat-value">{children}</span>
    </div>
  );
}

function WeatherWidget() {
  const weather = useWeatherStore((state) => state.weather);

  if (!weather) {
    return <div className="weather-widget fit">Loading weather…</div>;
  }

  return (
    <div className="weather-widget fit">
      <div className="weather-widget__header">
        <span className="weather-widget__icon">{weather.icon}</span>
        <div>
          <div className="weather-widget__temp">
            {Math.round(weather.temperature)}°C
          </div>
          <div className="weather-widget__label">{weather.label}</div>
        </div>
      </div>

      <div className="weather-widget__stats">
        <Stat label="Wind">
          <span
            className="weather-widget__arrow"
            style={{ transform: `rotate(${weather.windDirection}deg)` }}
          >
            ↑
          </span>
          {Math.round(weather.windSpeed)} km/h
        </Stat>
        <Stat label="Rain">{weather.precipitation} mm</Stat>
        <Stat label="Clouds">{Math.round(weather.cloudCover * 100)}%</Stat>
        <Stat label="Sky">
          {weather.isThunder ? "Storm" : weather.isSnow ? "Snow" : "Clear"}
        </Stat>
      </div>
    </div>
  );
}

export default WeatherWidget;
