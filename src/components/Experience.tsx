import PlantInstances from "./Grassfield/PlantInstances";
import Goals from "./goals/Goals";
import WeatherUpdater from "./weather -  vibecoded/WeatherUpdater";
import WeatherParticles from "./weather -  vibecoded/WeatherParticles";
import Clouds from "./weather -  vibecoded/Clouds";
import Lightning from "./weather -  vibecoded/Lightning";

function Experience() {
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
      <WeatherUpdater />
      <WeatherParticles />
      <Clouds />
      <Lightning />
    </>
  );
}

export default Experience;
