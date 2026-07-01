import { create } from "zustand";

import { fetchWeather, type Weather } from "../lib/weatherApi";

interface WeatherState {
  weather: Weather | null;
  refresh: (latitude: number, longitude: number) => Promise<void>;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  weather: null,
  refresh: async (latitude, longitude) => {
    const weather = await fetchWeather(latitude, longitude);
    set({ weather });
  },
}));
