import "maplibre-gl/dist/maplibre-gl.css";
import "./index.css";

import { StrictMode, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Leva, useControls } from "leva";
import { Map, type MapRef } from "react-map-gl/maplibre";
import { Canvas } from "react-three-map/maplibre";

import {
  COORDS,
  CAMERA_START,
  GLOBAL_MIN_ZOOM,
  GLOBAL_MAX_ZOOM,
  FOCUS_MAX_ZOOM,
  FOCUS_PAN_METRES,
  MAP_STYLE,
} from "./constants";
import { useDayNightCycle } from "./hooks/useDayNightCycle";
import { useCameraFocus } from "./hooks/useCameraFocus";
import { usePoiStore } from "./store/poiStore";
import { useMapStore } from "./store/mapStore";
import { useGameStore } from "./store/gameStore";
import Buildings from "./components/Buildings/Buildings";
import WelcomeScreen from "./components/WelcomeScreen/WelcomeScreen";
import LightningFlash from "./components/LightningFlash/LightningFlash";
import { useAudio } from "./hooks/useAudio";
import App from "./views/App";
import Experience from "./views/Experience";

type Bounds = [[number, number], [number, number]]; // [[w, s], [e, n]]

// Drag with no inertial glide (used while playing, so the centre-clamp has no
// easing animation to fight — that was causing the pan to briefly freeze).
const DRAG_NO_INERTIA = { maxSpeed: 0 };

// A tight box (in real metres) around the focused PoI, so panning while focused
// stays right on the goals — just enough to follow the ball.
function getFocusBounds(
  focus: { longitude: number; latitude: number } | null,
): Bounds | undefined {
  if (!focus) return undefined;
  const dLat = FOCUS_PAN_METRES / 111320;
  const dLng = dLat / Math.cos((focus.latitude * Math.PI) / 180);
  return [
    [focus.longitude - dLng, focus.latitude - dLat],
    [focus.longitude + dLng, focus.latitude + dLat],
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

  // While playing, keep the map centre inside the play-box walls so you can
  // follow the ball across the pitch without panning off the field.
  const playing = useGameStore((state) => state.playing);
  const playBounds = useGameStore((state) => state.playBounds);
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !playing || !playBounds) return;
    const [[west, south], [east, north]] = playBounds;
    const clampCentre = () => {
      const centre = map.getCenter();
      const lng = Math.min(east, Math.max(west, centre.lng));
      const lat = Math.min(north, Math.max(south, centre.lat));
      if (lng !== centre.lng || lat !== centre.lat) {
        map.setCenter([lng, lat]);
      }
    };
    map.on("move", clampCentre);
    return () => {
      map.off("move", clampCentre);
    };
  }, [playing, playBounds]);

  // While focused on a PoI, zoom/rotate are locked but we allow a little panning
  // (fenced to a tight box around the PoI) so you can follow the action.
  const focus = usePoiStore((state) => state.focus);
  const isFocused = focus !== null;
  const focusBounds = getFocusBounds(focus);

  // While you're dragging the ball, pause map panning so the two don't fight.
  const aiming = useGameStore((state) => state.aiming);

  // Lock panning entirely while focused on the goals but the game hasn't started.
  const activeName = usePoiStore((state) => state.activeName);
  const inGoalsIdle = isFocused && activeName === "Goals" && !playing;

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
        maxBounds={
          playing
            ? undefined
            : isFocused
              ? focusBounds
              : (panBounds ?? undefined)
        }
        scrollZoom={!isFocused}
        dragPan={
          aiming || inGoalsIdle ? false : playing ? DRAG_NO_INERTIA : true
        }
        dragRotate={!aiming}
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
