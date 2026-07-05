import { useControls } from "leva";

import PlantInstances, {
  MAX_DENSITY,
} from "../components/PlantInstances/PlantInstances";
import PointOfInterest from "../components/PointOfInterest/PointOfInterest";
import WeatherParticles from "../components/WeatherParticles/WeatherParticles";
import Clouds from "../components/Clouds/Clouds";
import Lightning from "../components/Lightning/Lightning";
import GoalGame from "../components/GoalGame/GoalGame";

import { useWeatherUpdater } from "../hooks/useWeatherUpdater";
import { usePoiStore } from "../store/poiStore";
import { POIS } from "../pois";

// The one PoI that carries the ball game (the goals).
const gamePoi = POIS.find((poi) => poi.game);

function Experience() {
  useWeatherUpdater();

  // Only run the physics world while its PoI is focused.
  const gameActive = usePoiStore((state) => state.activeName === gamePoi?.name);

  const MY_NATURE = [
    {
      url: "/scatter/plant.glb",
      nodeName: "plants",
      count: 50000,
    },
    {
      url: "/scatter/tree.glb",
      nodeName: "trees",
      count: 50,
    },
    {
      url: "/scatter/mushroom.glb",
      nodeName: "mushrooms",
      count: 50,
    },
    {
      url: "/scatter/flower.glb",
      nodeName: "flowers",
      count: 100,
    },
    {
      url: "/scatter/flower2.glb",
      nodeName: "flowers",
      count: 100,
    },
    {
      url: "/scatter/trunk.glb",
      nodeName: "trunks",
      count: 6,
    },
  ];

  const [density] = useControls("Density", () =>
    Object.fromEntries(
      MY_NATURE.map((model) => [
        model.nodeName,
        { value: 1, min: 0, max: MAX_DENSITY, step: 0.05 },
      ]),
    ),
  );

  return (
    <>
      <ambientLight intensity={Math.PI} />
      <directionalLight position={[10, 20, 10]} intensity={2} />
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
      <Lightning />
    </>
  );
}

export default Experience;
