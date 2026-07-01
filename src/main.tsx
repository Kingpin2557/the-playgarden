import "maplibre-gl/dist/maplibre-gl.css";
import "./index.css";

import { StrictMode, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Leva, useControls } from "leva";
import { Map, type MapRef } from "react-map-gl/maplibre";
import { Canvas } from "react-three-map/maplibre";

import { COORDS } from "./coords";
import { useDayNightCycle } from "./hooks/useDayNightCycle";
import Buildings from "./components/Buildings/Buildings";
import App from "./views/App";
import Experience from "./views/Experience";

const isDev = false;

function Root() {
  const mapRef = useRef<MapRef>(null);

  const { longitude, latitude } = useControls("Map", {
    longitude: { value: COORDS.longitude, step: 0.00001 },
    latitude: { value: COORDS.latitude, step: 0.00001 },
  });

  // Drives the MapLibre sky + light for the day/night cycle.
  useDayNightCycle(mapRef);

  return (
    <>
      <Leva hidden={isDev} />
      <App />
      <Map
        ref={mapRef}
        minPitch={0}
        maxPitch={80}
        minZoom={0}
        maxZoom={25}
        scrollZoom={true}
        dragPan={true}
        touchZoomRotate={true}
        keyboard={true}
        initialViewState={{ longitude, latitude, zoom: 50 }}
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
