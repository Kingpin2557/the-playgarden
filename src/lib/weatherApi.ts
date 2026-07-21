export interface Weather {
  temperature: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  isSnow: boolean;
  isThunder: boolean;
  isFog: boolean;
  icon: string;
  label: string;
}

function describeWeather(weatherCode: number): { icon: string; label: string } {
  switch (true) {
    case weatherCode === 0:
      return { icon: "☀️", label: "Clear" };
    case weatherCode <= 2:
      return { icon: "🌤️", label: "Partly cloudy" };
    case weatherCode === 3:
      return { icon: "☁️", label: "Overcast" };
    case weatherCode <= 48:
      return { icon: "🌫️", label: "Fog" };
    case weatherCode <= 57:
      return { icon: "🌦️", label: "Drizzle" };
    case weatherCode <= 67:
      return { icon: "🌧️", label: "Rain" };
    case weatherCode <= 77:
      return { icon: "🌨️", label: "Snow" };
    case weatherCode <= 82:
      return { icon: "🌧️", label: "Showers" };
    case weatherCode <= 86:
      return { icon: "🌨️", label: "Snow showers" };
    default:
      return { icon: "⛈️", label: "Thunderstorm" };
  }
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
      isFog:
        (current.weather_code ?? 0) >= 45 &&
        (current.weather_code ?? 0) <= 48,
      ...describeWeather(current.weather_code ?? 0),
    };
  } catch {
    return null;
  }
}
