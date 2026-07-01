import PlantInstances from "../components/PlantInstances/PlantInstances";
import Goals from "../components/Goals/Goals";
import WeatherParticles from "../components/WeatherParticles/WeatherParticles";
import Clouds from "../components/Clouds/Clouds";
import Lightning from "../components/Lightning/Lightning";
import { useWeatherUpdater } from "../hooks/useWeatherUpdater";

function Experience() {
  useWeatherUpdater();

  const MY_NATURE = [
    {
      url: "/models/plant.glb",
      nodeName: "plants",
      count: 10000,
    },
    {
      url: "/models/rock.glb",
      nodeName: "rocks",
      count: 500,
    },
    {
      url: "/models/tree.glb",
      nodeName: "trees",
      count: 500,
    },
  ];

  return (
    <>
      <ambientLight intensity={Math.PI} />
      <directionalLight position={[10, 20, 10]} intensity={2} />
      <Goals />
      <PlantInstances models={MY_NATURE} />
      <WeatherParticles />
      <Clouds />
      <Lightning />
    </>
  );
}

export default Experience;
