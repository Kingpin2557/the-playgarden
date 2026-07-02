import { create } from "zustand";

import { fetchWeather, type Weather } from "../lib/weatherApi";

export type WeatherMode = "auto" | "rain" | "snow";

interface WeatherState {
  weather: Weather | null;
  mode: WeatherMode;
  setMode: (mode: WeatherMode) => void;
  refresh: (latitude: number, longitude: number) => Promise<void>;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  weather: null,
  mode: "auto",
  setMode: (mode) => set({ mode }),
  refresh: async (latitude, longitude) => {
    const weather = await fetchWeather(latitude, longitude);
    set({ weather });
  },
}));
