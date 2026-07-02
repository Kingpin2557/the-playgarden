import { useEffect, useRef } from "react";

import { useAppStore } from "../store/appStore";
import { createAudioLoop } from "../lib/audioLoop";

const MUSIC_SOURCE = "/audio/music.mp3";
const MUSIC_VOLUME = 0.15;

export function useBackgroundMusic() {
  const entered = useAppStore((state) => state.entered);
  const audioEnabled = useAppStore((state) => state.audioEnabled);
  const loopRef = useRef<ReturnType<typeof createAudioLoop> | null>(null);

  const shouldPlay = entered && audioEnabled;

  useEffect(() => {
    if (!loopRef.current) {
      loopRef.current = createAudioLoop(MUSIC_VOLUME);
    }
    const loop = loopRef.current;

    if (shouldPlay) {
      loop.play(MUSIC_SOURCE);
    } else {
      loop.stop();
    }
  }, [shouldPlay]);
}
