import { useAppStore } from "../store/appStore";

const THUNDER_SOURCES = ["/audio/thunder.mp3", "/audio/thunder_strike.mp3"];
const THUNDER_VOLUME = 0.7;
const MIN_DELAY_MS = 300;
const MAX_DELAY_MS = 1800;

export function playThunderClap() {
  const { entered, audioEnabled } = useAppStore.getState();
  if (!entered || !audioEnabled) return;

  const source =
    THUNDER_SOURCES[Math.floor(Math.random() * THUNDER_SOURCES.length)];
  const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  window.setTimeout(() => {
    const clap = new Audio(source);
    clap.volume = THUNDER_VOLUME;
    clap.play().catch(() => {});
  }, delay);
}
