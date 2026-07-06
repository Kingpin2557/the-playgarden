import { create } from "zustand";

import { fetchWeather, type Weather } from "../lib/weatherApi";

export type WeatherMode = "auto" | "rain" | "snow" | "fog";

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
