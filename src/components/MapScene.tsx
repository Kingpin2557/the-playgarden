import { button, LevaPanel, useControls, useCreateStore } from "leva";
import { Map } from "react-map-gl/maplibre";
import { Canvas } from "react-three-map/maplibre";
import { useState } from "react";

import Buildings from "./Buildings.tsx";
import Experience from "./experience/Experience.tsx";

function MapScene() {
  const locationStore = useCreateStore();

  const [coords, setCoords] = useState({
    longitude: 3.714381547403736,
    latitude: 51.064053600278754,
  });

  const { longitude, latitude } = useControls(
    "Map",
    {
      longitude: { value: coords.longitude, step: 1e-7 },
      latitude: { value: coords.latitude, step: 1e-7 },

      apply: button(() => {
        console.log("New location applied: ", { longitude, latitude });
        setCoords({ longitude, latitude });
      }),
    },
    { store: locationStore },
  );
  return (
    <>
      <LevaPanel store={locationStore} />

      <Map
        initialViewState={{
          longitude: longitude,
          latitude: latitude,
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
