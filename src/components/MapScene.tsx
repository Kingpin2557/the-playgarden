import { useControls } from "leva";
import { Map } from "react-map-gl/maplibre";
import { Canvas } from "react-three-map/maplibre";

import Buildings from "./Buildings.tsx";
import Experience from "./Experience.tsx";

function MapScene() {
  const intial = {
    longitude: 3.7144315474037364,
    latitude: 51.063943600278726,
  };
  const { longitude, latitude } = useControls("Map", {
    longitude: { value: intial.longitude, step: 0.00001 },
    latitude: { value: intial.latitude, step: 0.00001 },
  });

  return (
    <>
      <Map
        minPitch={0}
        maxPitch={80}
        minZoom={0}
        maxZoom={25}
        scrollZoom={true}
        dragPan={true}
        touchZoomRotate={true}
        keyboard={true}
        initialViewState={{
          longitude,
          latitude,
          zoom: 50,
        }}
        mapStyle={`https://api.maptiler.com/maps/base-v4/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`}
        style={{ width: "100vw", height: "100vh" }}
      >
        <Buildings />
        <Canvas longitude={longitude} latitude={latitude}>
          <Experience />
        </Canvas>
      </Map>
    </>
  );
}

export default MapScene;
