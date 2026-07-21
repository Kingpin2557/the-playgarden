import { useEffect, useRef } from "react";

import {
  useWeatherStore,
  isRaining,
  isSnowing,
  isThundering,
  type WeatherMode,
} from "../store/weatherStore";
import { useAppStore } from "../store/appStore";
import type { Weather } from "../lib/weatherApi";
import { createAudioLoop } from "../lib/audioLoop";

const MUSIC_SOURCE = "/audio/music.mp3";
const MUSIC_VOLUME = 0.15;
const AMBIENT_VOLUME = 0.5;

const AMBIENT_SOURCES = {
  snow: "/audio/snow.mp3",
  rain: "/audio/rain.mp3",
};

type AmbientKey = keyof typeof AMBIENT_SOURCES;

// A thunderstorm still gets the rain loop — it's stormy weather, not its own
// ambient track.
function pickAmbient(mode: WeatherMode, weather: Weather | null): AmbientKey | null {
  if (isSnowing(mode, weather)) return "snow";
  if (isRaining(mode, weather) || isThundering(mode, weather)) return "rain";
  return null;
}

export function useAudio() {
  const weather = useWeatherStore((state) => state.weather);
  const mode = useWeatherStore((state) => state.mode);
  const entered = useAppStore((state) => state.entered);
  const audioEnabled = useAppStore((state) => state.audioEnabled);

  const musicRef = useRef<ReturnType<typeof createAudioLoop> | null>(null);
  const ambientRef = useRef<ReturnType<typeof createAudioLoop> | null>(null);

  const soundOn = entered && audioEnabled;
  const ambient = soundOn ? pickAmbient(mode, weather) : null;

  useEffect(() => {
    if (!musicRef.current) {
      musicRef.current = createAudioLoop(MUSIC_VOLUME);
    }
    const music = musicRef.current;

    if (soundOn) {
      music.play(MUSIC_SOURCE);
    } else {
      music.stop();
    }
  }, [soundOn]);

  useEffect(() => {
    if (!ambientRef.current) {
      ambientRef.current = createAudioLoop(AMBIENT_VOLUME);
    }
    const ambientLoop = ambientRef.current;

    if (!ambient) {
      ambientLoop.stop();
      return;
    }
    ambientLoop.play(AMBIENT_SOURCES[ambient]);
  }, [ambient]);
}
