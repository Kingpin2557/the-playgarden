import { useRef, useEffect } from "react";
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
import type { LngLatBounds } from "./types";
import { useDayNightCycle } from "./hooks/useDayNightCycle";
import { useCameraFocus } from "./hooks/useCameraFocus";
import { useAudio } from "./hooks/useAudio";
import { usePoiStore } from "./store/poiStore";
import { useMapStore } from "./store/mapStore";
import { useGameStore } from "./store/gameStore";
import Buildings from "./components/Buildings/Buildings";
import WelcomeScreen from "./components/WelcomeScreen/WelcomeScreen";
import LightningFlash from "./components/LightningFlash/LightningFlash";
import Hud from "./components/Hud/Hud";
import Experience from "./components/Experience/Experience";

// Drag with no inertial glide (used while playing, so the centre-clamp has no
// easing animation to fight — that was causing the pan to briefly freeze).
const DRAG_NO_INERTIA = { maxSpeed: 0 };

// A tight box (in real metres) around the focused PoI, so panning while focused
// stays right on the goals — just enough to follow the ball.
function getFocusBounds(
  focus: { longitude: number; latitude: number } | null,
): LngLatBounds | undefined {
  if (!focus) return undefined;
  const dLat = FOCUS_PAN_METRES / 111320;
  const dLng = dLat / Math.cos((focus.latitude * Math.PI) / 180);
  return [
    [focus.longitude - dLng, focus.latitude - dLat],
    [focus.longitude + dLng, focus.latitude + dLat],
  ];
}

// No drag at all while aiming a shot or while any PoI is focused and idle; no
// inertia once the goals game has actually started (so the play-bounds clamp
// above never fights the glide); normal drag otherwise.
function resolveDragPan(aiming: boolean, lockedByFocus: boolean, playing: boolean) {
  switch (true) {
    case aiming || lockedByFocus:
      return false;
    case playing:
      return DRAG_NO_INERTIA;
    default:
      return true;
  }
}

// The map's pan fence: unrestricted while playing (the play-bounds clamp
// handles it instead), a tight box around a focused PoI, or the scene's own
// pan box otherwise.
function resolveMaxBounds(
  playing: boolean,
  isFocused: boolean,
  focusBounds: LngLatBounds | undefined,
  panBounds: LngLatBounds | null,
) {
  switch (true) {
    case playing:
      return undefined;
    case isFocused:
      return focusBounds;
    default:
      return panBounds ?? undefined;
  }
}

// The single top-level view: the map, the 3D scene on top of it, and the HUD.
// There's no routing in this app, so App.tsx owns the whole experience rather
// than being a thin wrapper around a router outlet.
function App() {
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

  // Lock panning while any PoI is focused — the one exception is the goals
  // mini-game, which unlocks panning once it has actually started. Rotating
  // stays available the whole time you're focused, so you can still look
  // around the PoI; it only pauses while you're aiming a shot.
  const lockedByFocus = isFocused && !playing;

  // Panning is fenced to the plane's bounding box (+20%), measured in the scene.
  const panBounds = useMapStore((state) => state.panBounds);

  const isProd = import.meta.env.VITE_IS_PROD === "true";
  const hideLeva = isProd;

  // A quick way to see the raw scene while tuning in Leva, with none of the
  // regular UI (welcome screen, lightning flash, HUD) in the way.
  const { hideUi } = useControls("Debug", {
    hideUi: { value: false, label: "hide UI" },
  });

  return (
    <>
      {!hideUi && (
        <>
          <WelcomeScreen />
          <LightningFlash />
          <Hud />
        </>
      )}
      <Leva hidden={hideLeva} />
      <Map
        ref={mapRef}
        minPitch={0}
        maxPitch={80}
        minZoom={GLOBAL_MIN_ZOOM}
        maxZoom={isFocused ? FOCUS_MAX_ZOOM : GLOBAL_MAX_ZOOM}
        maxBounds={resolveMaxBounds(playing, isFocused, focusBounds, panBounds)}
        scrollZoom={!isFocused}
        dragPan={resolveDragPan(aiming, lockedByFocus, playing)}
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

export default App;
