import { useControls } from "leva";

import PlantInstances, {
  MAX_DENSITY,
} from "../components/PlantInstances/PlantInstances";
import Goals from "../components/goals/Goals";
import Swing from "../components/wing/Swing";
import Climbhouse from "../components/Climbhouse/Climbhouse";
import WeatherParticles from "../components/weatherparticles/WeatherParticles";
import Clouds from "../components/Clouds/Clouds";
import Lightning from "../components/Lightning/Lightning";

import { useWeatherUpdater } from "../hooks/useWeatherUpdater";
import Whip from "../components/Whip/Whip";

function Experience() {
  useWeatherUpdater();

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
      <Goals />
      <Climbhouse />
      <Swing />
      <Whip />
      <Clouds />
      <Lightning />
    </>
  );
}

export default Experience;
