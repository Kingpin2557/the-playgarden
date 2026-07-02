import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useMap } from "react-three-map/maplibre";
import { useControls } from "leva";

import { useWeatherStore } from "../../store/weatherStore";
import { playThunderClap } from "../../lib/thunderAudio";

const MIN_GAP_SECONDS = 3;
const MAX_GAP_SECONDS = 9;
const FLASH_POWER = 6;
const FADE_SPEED = 12;

function Lightning() {
  const map = useMap();
  const weather = useWeatherStore((state) => state.weather);
  const { forceLightning } = useControls("Lightning", { forceLightning: false });

  const lightRef = useRef<THREE.DirectionalLight>(null!);
  const flashBrightness = useRef(0);
  const secondsUntilNextStrike = useRef(2);

  useFrame((_state, deltaSeconds) => {
    const isStorming = forceLightning || !!weather?.isThunder;
    if (!isStorming && flashBrightness.current === 0) return;

    if (isStorming) {
      secondsUntilNextStrike.current -= deltaSeconds;
      if (secondsUntilNextStrike.current <= 0) {
        flashBrightness.current = FLASH_POWER * (0.6 + Math.random() * 0.4);
        useWeatherStore.getState().strike();
        playThunderClap();
        secondsUntilNextStrike.current =
          MIN_GAP_SECONDS + Math.random() * (MAX_GAP_SECONDS - MIN_GAP_SECONDS);
      }
    }

    flashBrightness.current = Math.max(
      0,
      flashBrightness.current - deltaSeconds * FADE_SPEED,
    );
    lightRef.current.intensity = flashBrightness.current;
    map.triggerRepaint();
  });

  return (
    <directionalLight ref={lightRef} position={[0, 200, 60]} intensity={0} color="#eaf2ff" />
  );
}

export default Lightning;
