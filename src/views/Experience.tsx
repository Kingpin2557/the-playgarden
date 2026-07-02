import PlantInstances from "../components/PlantInstances/PlantInstances";
import Goals from "../components/goals/Goals";
import Swing from "../components/wing/Swing";
import Climbhouse from "../components/Climbhouse/Climbhouse";
import WeatherParticles from "../components/weatherparticles/WeatherParticles";
import Clouds from "../components/Clouds/Clouds";
import Lightning from "../components/Lightning/Lightning";

import { useWeatherUpdater } from "../hooks/useWeatherUpdater";
import { useFocusPlaneCenter } from "../hooks/useFocusPlaneCenter";
import Whip from "../components/Whip/Whip";

function Experience() {
  useWeatherUpdater();
  useFocusPlaneCenter(); // aim the camera at the plane's bounding-box center

  const MY_NATURE = [
    {
      url: "/scatter/plant.glb",
      nodeName: "plants",
      count: 500000,
    },
    {
      url: "/scatter/tree.glb",
      nodeName: "trees",
      count: 50,
      occludes: true,
    },
  ];

  return (
    <>
      <ambientLight intensity={Math.PI} />
      <directionalLight position={[10, 20, 10]} intensity={2} />
      <PlantInstances models={MY_NATURE} />
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
