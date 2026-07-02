import "maplibre-gl/dist/maplibre-gl.css";
import "./index.css";

import { StrictMode, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Leva, useControls } from "leva";
import { Map, type MapRef } from "react-map-gl/maplibre";
import { Canvas } from "react-three-map/maplibre";

import { COORDS } from "./coords";
import { useDayNightCycle } from "./hooks/useDayNightCycle";
import { useCameraFocus } from "./hooks/useCameraFocus";
import { usePoiStore } from "./store/poiStore";
import Buildings from "./components/Buildings/Buildings";
import WelcomeScreen from "./components/WelcomeScreen/WelcomeScreen";
import LightningFlash from "./components/LightningFlash/LightningFlash";
import { useWeatherAudio } from "./hooks/useWeatherAudio";
import { useBackgroundMusic } from "./hooks/useBackgroundMusic";
import App from "./views/App";
import Experience from "./views/Experience";

const CAMERA_START = { zoom: 18, pitch: 52, bearing: 142 };

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

function Root() {
  const mapRef = useRef<MapRef>(null);

  const { longitude, latitude } = useControls("Map", {
    longitude: { value: COORDS.longitude, step: 0.00001 },
    latitude: { value: COORDS.latitude, step: 0.00001 },
  });

  const { zoom, pitch, bearing } = useControls("Camera", {
    zoom: { value: CAMERA_START.zoom, step: 1 },
    pitch: { value: CAMERA_START.pitch, step: 1 },
    bearing: { value: CAMERA_START.bearing, step: 1 },
  });
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.jumpTo({ zoom, pitch, bearing });
  }, [zoom, pitch, bearing]);

  useDayNightCycle(mapRef);
  useCameraFocus(mapRef); // flies to a PoI when one is focused
  useWeatherAudio();
  useBackgroundMusic();

  // While focused on a PoI the camera is fixed (no dragging/orbiting/zooming).
  const isFocused = usePoiStore((state) => state.focus !== null);

  const isProd = import.meta.env.VITE_IS_PROD === "true";
  const hideLeva = isProd;

  return (
    <>
      <WelcomeScreen />
      <LightningFlash />
      <Leva hidden={hideLeva} />
      <App />
      <Map
        ref={mapRef}
        minPitch={0}
        maxPitch={80}
        minZoom={0}
        maxZoom={25}
        scrollZoom={!isFocused}
        dragPan={false}
        dragRotate={isFocused}
        pitchWithRotate={false}
        touchPitch={false}
        touchZoomRotate={false}
        doubleClickZoom={!isFocused}
        keyboard={false}
        initialViewState={{
          longitude,
          latitude,
          zoom: zoom,
          pitch: pitch,
          bearing: bearing,
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
