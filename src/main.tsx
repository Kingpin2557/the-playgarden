import "maplibre-gl/dist/maplibre-gl.css";
import "./index.css";

import { StrictMode, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Leva, useControls } from "leva";
import { Map, type MapRef } from "react-map-gl/maplibre";
import { Canvas } from "react-three-map/maplibre";

import { COORDS } from "./coords";
import { useDayNightCycle } from "./hooks/useDayNightCycle";
import { useCameraFocus } from "./hooks/useCameraFocus";
import { usePoiStore } from "./store/poiStore";
import Buildings from "./components/Buildings/Buildings";
import App from "./views/App";
import Experience from "./views/Experience";

const isDev = false;

const CAMERA_START = { zoom: 20, pitch: 60, bearing: 30 };

// Keyless map style (OpenFreeMap). Alternatives: .../styles/positron | .../styles/bright
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

function Root() {
  const mapRef = useRef<MapRef>(null);

  const { longitude, latitude } = useControls("Map", {
    longitude: { value: COORDS.longitude, step: 0.00001 },
    latitude: { value: COORDS.latitude, step: 0.00001 },
  });

  useDayNightCycle(mapRef);
  useCameraFocus(mapRef); // flies to a PoI when one is focused

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
        dragPan={false}
        dragRotate={true}
        touchZoomRotate={true}
        keyboard={false}
        initialViewState={{
          longitude,
          latitude,
          zoom: CAMERA_START.zoom,
          pitch: CAMERA_START.pitch,
          bearing: CAMERA_START.bearing,
        }}
        mapStyle={MAP_STYLE}
        style={{ width: "100vw", height: "100vh" }}
      >
        <Buildings />
        <Canvas
          longitude={longitude}
          latitude={latitude}
          onPointerMissed={() => usePoiStore.getState().clear()}
        >
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
