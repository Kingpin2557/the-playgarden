import { useEffect } from "react";
import { useMap } from "react-three-map/maplibre";

import { fetchWeather } from "./weatherApi";
import { useWeatherStore } from "../../store/weatherStore";

// Re-check the weather this often so it changes over time on its own.
const REFRESH_MILLISECONDS = 2 * 60 * 1000; // every 2 minutes

// Round so tiny pans don't spam the weather API (~1 km resolution).
const roundCoordinate = (value: number) => Math.round(value * 100) / 100;

// Invisible component: it just keeps the shared weather store up to date for
// wherever the map is currently looking.
function WeatherUpdater() {
  const map = useMap();
  const setWeather = useWeatherStore((state) => state.setWeather);

  useEffect(() => {
    let isCancelled = false;

    const updateWeather = async () => {
      const center = map.getCenter();
      const latitude = roundCoordinate(center.lat);
      const longitude = roundCoordinate(center.lng);
      const weather = await fetchWeather(latitude, longitude);
      if (!isCancelled) setWeather(weather);
    };

    updateWeather(); // fetch straight away
    map.on("moveend", updateWeather); // and whenever you stop panning
    const refreshTimer = setInterval(updateWeather, REFRESH_MILLISECONDS);

    return () => {
      isCancelled = true;
      map.off("moveend", updateWeather);
      clearInterval(refreshTimer);
    };
  }, [map, setWeather]);

  return null;
}

export default WeatherUpdater;
