// Talks to the Open-Meteo weather API (free, no key needed) and returns a
// simple, ready-to-use weather object for one location.

export interface Weather {
  temperature: number; // °C
  precipitation: number; // mm in the last hour
  windSpeed: number; // km/h
  windDirection: number; // degrees (0 = coming from the north)
  cloudCover: number; // 0..1 (fraction of sky covered)
  isSnow: boolean;
  isThunder: boolean;
  icon: string; // emoji you can drop straight into the UI
  label: string; // short text, e.g. "Light rain"
}

// Turns an Open-Meteo weather code into an icon + label.
// Codes: https://open-meteo.com/en/docs (WMO weather codes)
function describeWeather(weatherCode: number): { icon: string; label: string } {
  if (weatherCode === 0) return { icon: "☀️", label: "Clear" };
  if (weatherCode <= 2) return { icon: "🌤️", label: "Partly cloudy" };
  if (weatherCode === 3) return { icon: "☁️", label: "Overcast" };
  if (weatherCode <= 48) return { icon: "🌫️", label: "Fog" };
  if (weatherCode <= 57) return { icon: "🌦️", label: "Drizzle" };
  if (weatherCode <= 67) return { icon: "🌧️", label: "Rain" };
  if (weatherCode <= 77) return { icon: "🌨️", label: "Snow" };
  if (weatherCode <= 82) return { icon: "🌧️", label: "Showers" };
  if (weatherCode <= 86) return { icon: "🌨️", label: "Snow showers" };
  return { icon: "⛈️", label: "Thunderstorm" };
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
): Promise<Weather | null> {
  const requestUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,precipitation,snowfall,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m`;

  try {
    const response = await fetch(requestUrl);
    const data = await response.json();
    const current = data.current ?? {};

    return {
      temperature: current.temperature_2m ?? 0,
      precipitation: current.precipitation ?? 0,
      windSpeed: current.wind_speed_10m ?? 0,
      windDirection: current.wind_direction_10m ?? 0,
      cloudCover: (current.cloud_cover ?? 0) / 100,
      isSnow:
        (current.snowfall ?? 0) > 0 || (current.temperature_2m ?? 99) <= 0,
      isThunder: (current.weather_code ?? 0) >= 95,
      ...describeWeather(current.weather_code ?? 0),
    };
  } catch {
    return null;
  }
}
