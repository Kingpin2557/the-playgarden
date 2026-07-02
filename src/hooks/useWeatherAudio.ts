import { useEffect, useRef } from "react";

import { useWeatherStore, type WeatherMode } from "../store/weatherStore";
import { useAppStore } from "../store/appStore";
import type { Weather } from "../lib/weatherApi";
import { createAudioLoop } from "../lib/audioLoop";

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
  const loopRef = useRef<ReturnType<typeof createAudioLoop> | null>(null);

  const ambient = entered && audioEnabled ? pickAmbient(mode, weather) : null;

  useEffect(() => {
    if (!loopRef.current) {
      loopRef.current = createAudioLoop(AMBIENT_VOLUME);
    }
    const loop = loopRef.current;

    if (!ambient) {
      loop.stop();
      return;
    }
    loop.play(AMBIENT_SOURCES[ambient]);
  }, [ambient]);
}
