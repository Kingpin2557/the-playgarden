import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";

import PlantInstances, {
  MAX_DENSITY,
} from "../PlantInstances/PlantInstances";
import PointOfInterest from "../PointOfInterest/PointOfInterest";
import WeatherParticles from "../WeatherParticles/WeatherParticles";
import Clouds from "../Clouds/Clouds";
import GroundMist from "../GroundMist/GroundMist";
import Lightning from "../Lightning/Lightning";
import GoalGame from "../GoalGame/GoalGame";

import { useWeatherUpdater } from "../../hooks/useWeatherUpdater";
import { usePoiStore } from "../../store/poiStore";
import { dayNight } from "../../lib/dayNight";
import { POIS, MY_NATURE, NATURE_DENSITY_DEFAULT } from "../../constants";

const gamePoi = POIS.find((poi) => poi.game);

const NIGHT_LIGHT = new THREE.Color("#2a3a5c");
const DAY_LIGHT = new THREE.Color("#fff4e0");

function Experience() {
  useWeatherUpdater();

  const gameActive = usePoiStore((state) => state.activeName === gamePoi?.name);

  const [density] = useControls("Density", () =>
    Object.fromEntries(
      MY_NATURE.map((model) => [
        model.nodeName,
        { value: NATURE_DENSITY_DEFAULT, min: 0, max: MAX_DENSITY, step: 0.05 },
      ]),
    ),
  );

  const ambientRef = useRef<THREE.AmbientLight>(null!);
  const sunRef = useRef<THREE.DirectionalLight>(null!);
  useFrame(() => {
    const day = dayNight.dayAmount;
    const gloom = dayNight.gloom;
    if (ambientRef.current) {
      ambientRef.current.intensity = (0.25 + day * 2.9) * (1 - gloom * 0.5);
    }
    if (sunRef.current) {
      sunRef.current.intensity = (0.05 + day * 1.95) * (1 - gloom * 0.45);
      sunRef.current.color.copy(NIGHT_LIGHT).lerp(DAY_LIGHT, day);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={Math.PI} />
      <directionalLight ref={sunRef} position={[10, 20, 10]} intensity={2} />
      <PlantInstances models={MY_NATURE} density={density} />
      <WeatherParticles />
      {POIS.map((poi) => (
        <PointOfInterest key={poi.name} {...poi} />
      ))}
      {gameActive && gamePoi && (
        <GoalGame
          center={{ x: gamePoi.position.x, z: gamePoi.position.y }}
          url={gamePoi.url}
          rotation={gamePoi.rotation}
        />
      )}
      <Clouds />
      <GroundMist />
      <Lightning />
    </>
  );
}

export default Experience;
