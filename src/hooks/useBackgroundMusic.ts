import { useEffect, useRef } from "react";

import { useAppStore } from "../store/appStore";

const MUSIC_SOURCE = "/audio/music.mp3";
const MUSIC_VOLUME = 0.15;

export function useBackgroundMusic() {
  const entered = useAppStore((state) => state.entered);
  const audioEnabled = useAppStore((state) => state.audioEnabled);
  const playerRef = useRef<HTMLAudioElement | null>(null);

  const shouldPlay = entered && audioEnabled;

  useEffect(() => {
    if (!playerRef.current) {
      playerRef.current = new Audio(MUSIC_SOURCE);
      playerRef.current.loop = true;
      playerRef.current.volume = MUSIC_VOLUME;
    }
    const player = playerRef.current;

    if (shouldPlay) {
      player.play().catch(() => {});
    } else {
      player.pause();
    }
  }, [shouldPlay]);
}
