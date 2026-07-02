import { useEffect, useRef } from "react";

import { useWeatherStore, type WeatherMode } from "../store/weatherStore";
import { useAppStore } from "../store/appStore";
import type { Weather } from "../lib/weatherApi";

const AMBIENT_VOLUME = 0.5;

const AMBIENT_SOURCES = {
  snow: "/audio/snow.mp3",
  rain: "/audio/rain.mp3",
};

type AmbientKey = keyof typeof AMBIENT_SOURCES;

function pickAmbient(mode: WeatherMode, weather: Weather | null): AmbientKey | null {
  const isSnow = mode === "snow" || (mode === "auto" && !!weather?.isSnow);
  const isRain =
    mode === "rain" ||
    (mode === "auto" &&
      (!!weather?.isThunder || (weather?.precipitation ?? 0) > 0));

  if (isSnow) return "snow";
  if (isRain) return "rain";
  return null;
}

export function useWeatherAudio() {
  const weather = useWeatherStore((state) => state.weather);
  const mode = useWeatherStore((state) => state.mode);
  const entered = useAppStore((state) => state.entered);
  const audioEnabled = useAppStore((state) => state.audioEnabled);
  const playerRef = useRef<HTMLAudioElement | null>(null);

  const ambient = entered && audioEnabled ? pickAmbient(mode, weather) : null;

  useEffect(() => {
    if (!playerRef.current) {
      playerRef.current = new Audio();
      playerRef.current.loop = true;
      playerRef.current.volume = AMBIENT_VOLUME;
    }
    const player = playerRef.current;

    if (!ambient) {
      player.pause();
      return;
    }

    const nextSource = AMBIENT_SOURCES[ambient];
    if (!player.src.endsWith(nextSource)) {
      player.src = nextSource;
    }
    player.play().catch(() => {});
  }, [ambient]);
}
