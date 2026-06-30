import { useEffect, useState } from "react";

// Simplified current weather for one location. Data comes from Open-Meteo
// (free, no API key needed).
export interface Weather {
  temperature: number; // °C
  precipitation: number; // mm in the last hour
  windSpeed: number; // km/h
  windDirection: number; // degrees (0 = from north)
  isSnow: boolean;
  icon: string; // emoji you can drop straight into UI
  label: string; // short text, e.g. "Light rain"
}

// Turns an Open-Meteo weather code into an icon + label.
// Codes: https://open-meteo.com/en/docs (WMO weather codes)
function describe(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: "☀️", label: "Clear" };
  if (code <= 2) return { icon: "🌤️", label: "Partly cloudy" };
  if (code === 3) return { icon: "☁️", label: "Overcast" };
  if (code <= 48) return { icon: "🌫️", label: "Fog" };
  if (code <= 57) return { icon: "🌦️", label: "Drizzle" };
  if (code <= 67) return { icon: "🌧️", label: "Rain" };
  if (code <= 77) return { icon: "🌨️", label: "Snow" };
  if (code <= 82) return { icon: "🌧️", label: "Showers" };
  if (code <= 86) return { icon: "🌨️", label: "Snow showers" };
  return { icon: "⛈️", label: "Thunderstorm" };
}

export function useWeather(lat: number, lon: number): Weather | null {
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,precipitation,snowfall,weather_code,wind_speed_10m,wind_direction_10m`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const c = data.current ?? {};
        setWeather({
          temperature: c.temperature_2m ?? 0,
          precipitation: c.precipitation ?? 0,
          windSpeed: c.wind_speed_10m ?? 0,
          windDirection: c.wind_direction_10m ?? 0,
          isSnow: (c.snowfall ?? 0) > 0 || (c.temperature_2m ?? 99) <= 0,
          ...describe(c.weather_code ?? 0),
        });
      })
      .catch(() => setWeather(null));
  }, [lat, lon]);

  return weather;
}
