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

const DRAG_NO_INERTIA = { maxSpeed: 0 };

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
  useCameraFocus(mapRef);
  useAudio();

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

  const focus = usePoiStore((state) => state.focus);
  const isFocused = focus !== null;
  const focusBounds = getFocusBounds(focus);

  const aiming = useGameStore((state) => state.aiming);

  const lockedByFocus = isFocused && !playing;

  const panBounds = useMapStore((state) => state.panBounds);

  const isProd = import.meta.env.VITE_IS_PROD === "true";
  const hideLeva = isProd;

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
