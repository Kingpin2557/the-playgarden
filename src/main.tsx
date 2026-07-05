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
import { useMapStore } from "./store/mapStore";
import Buildings from "./components/Buildings/Buildings";
import WelcomeScreen from "./components/WelcomeScreen/WelcomeScreen";
import LightningFlash from "./components/LightningFlash/LightningFlash";
import { useAudio } from "./hooks/useAudio";
import App from "./views/App";
import Experience from "./views/Experience";

const CAMERA_START = { zoom: 24, pitch: 74, bearing: 142 };

const GLOBAL_MIN_ZOOM = 15;
const GLOBAL_MAX_ZOOM = 20; // global zoom-in stops here
const FOCUS_MAX_ZOOM = 22; // the PoI fly-to needs to go closer than global

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

const FOCUS_PAN = 0.0003; // ~20-30 m of leeway around a focused PoI

type Bounds = [number, number, number, number]; // [west, south, east, north]

// A small box around the focused PoI, so panning while focused is fenced to just
// enough room to follow the ball.
function getFocusBounds(
  focus: { longitude: number; latitude: number } | null,
): Bounds | undefined {
  if (!focus) return undefined;
  return [
    focus.longitude - FOCUS_PAN,
    focus.latitude - FOCUS_PAN,
    focus.longitude + FOCUS_PAN,
    focus.latitude + FOCUS_PAN,
  ];
}

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
  useAudio();

  // While focused on a PoI, zoom/rotate are locked but we allow a little panning
  // (fenced to a small box around the PoI) so you can follow the action.
  const focus = usePoiStore((state) => state.focus);
  const isFocused = focus !== null;
  const focusBounds = getFocusBounds(focus);

  // Panning is fenced to the plane's bounding box (+20%), measured in the scene.
  const panBounds = useMapStore((state) => state.panBounds);

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
        minZoom={GLOBAL_MIN_ZOOM}
        maxZoom={isFocused ? FOCUS_MAX_ZOOM : GLOBAL_MAX_ZOOM}
        maxBounds={isFocused ? focusBounds : (panBounds ?? undefined)}
        scrollZoom={!isFocused}
        dragPan={true}
        dragRotate={true}
        pitchWithRotate={false}
        touchPitch={false}
        touchZoomRotate={!isFocused}
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
