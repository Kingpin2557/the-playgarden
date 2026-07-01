import { create } from "zustand";

import type { Weather } from "../components/weather -  vibecoded/weatherApi";

// One shared, live weather value for the whole app. WeatherUpdater writes it;
// the particles, clouds, lightning and the badge all read it.
interface WeatherState {
  weather: Weather | null;
  setWeather: (weather: Weather | null) => void;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  weather: null,
  setWeather: (weather) => set({ weather }),
}));
