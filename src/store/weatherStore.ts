import { create } from "zustand";

import { fetchWeather, type Weather } from "../lib/weatherApi";

export type WeatherMode = "auto" | "rain" | "snow" | "thunder";

interface WeatherState {
  weather: Weather | null;
  mode: WeatherMode;
  strikeCount: number;
  setMode: (mode: WeatherMode) => void;
  strike: () => void;
  refresh: (latitude: number, longitude: number) => Promise<void>;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  weather: null,
  mode: "auto",
  strikeCount: 0,
  setMode: (mode) => set({ mode }),
  strike: () => set((state) => ({ strikeCount: state.strikeCount + 1 })),
  refresh: async (latitude, longitude) => {
    const weather = await fetchWeather(latitude, longitude);
    set({ weather });
  },
}));

// Derived weather facts, shared by anything that needs to know what's
// actually happening right now. A Leva mode override always wins over the
// real forecast; only "auto" looks at the forecast at all.

// Whether it's forced or actually snowing right now.
export function isSnowing(mode: WeatherMode, weather: Weather | null): boolean {
  switch (mode) {
    case "snow":
      return true;
    case "auto":
      return !!weather?.isSnow;
    default:
      return false;
  }
}

// Whether it's forced or actually thundering right now.
export function isThundering(mode: WeatherMode, weather: Weather | null): boolean {
  return mode === "thunder" || (mode === "auto" && !!weather?.isThunder);
}

// Whether it's forced or actually raining right now — a thunderstorm brings
// its own rain along with it.
export function isRaining(mode: WeatherMode, weather: Weather | null): boolean {
  switch (mode) {
    case "rain":
    case "thunder":
      return true;
    case "auto":
      return (weather?.precipitation ?? 0) > 0;
    default:
      return false;
  }
}

// 0..1: how heavy the rain/snow particles should fall. Forced modes always
// show at full intensity; "auto" scales with the real forecast.
export function precipitationIntensity(
  mode: WeatherMode,
  weather: Weather | null,
): number {
  switch (mode) {
    case "rain":
    case "snow":
    case "thunder":
      return 1;
    case "auto":
      return Math.min((weather?.precipitation ?? 0) / 5, 1);
  }
}
