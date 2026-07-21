import { useEffect, useRef, type MouseEvent } from "react";
import * as THREE from "three";
import { Html, useGLTF } from "@react-three/drei";
import { type ThreeEvent } from "@react-three/fiber";
import { useMap, vector3ToCoords } from "react-three-map/maplibre";
import { useControls } from "leva";

import "./PointOfInterest.css";
import { COORDS } from "../../constants";
import { usePoiStore } from "../../store/poiStore";
import { useAppStore } from "../../store/appStore";
import { useGameStore } from "../../store/gameStore";
import { usePoiPresentation, boundingBoxCenter } from "../../hooks/usePoiPresentation";

interface PointOfInterestProps {
  name: string;
  url: string;
  folder: string;
  position: { x: number; y: number };
  rotation: number;
  view: { zoom: number; pitch: number; bearing: number };
  game?: boolean;
}

function PointOfInterest({
  name,
  url,
  folder,
  position,
  rotation,
  view,
  game,
}: PointOfInterestProps) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Object3D>(null!);
  const map = useMap();
  const setFocus = usePoiStore((state) => state.setFocus);
  const clear = usePoiStore((state) => state.clear);
  const isActive = usePoiStore((state) => state.activeName === name);
  const isHinted = useAppStore((state) => state.hintPoi === name);
  const setGoalPlacement = useGameStore((state) => state.setGoalPlacement);
  const playing = useGameStore((state) => state.playing);

  const {
    position: placement,
    rotation: spin,
    zoom,
    pitch,
    bearing,
  } = useControls(folder, {
    position: { value: position, step: 1, joystick: "invertY" },
    rotation: { value: rotation, min: 0, max: 360, step: 1 },
    zoom: { value: view.zoom, min: 0, max: 25, step: 0.5 },
    pitch: { value: view.pitch, min: 0, max: 80, step: 1 },
    bearing: { value: view.bearing, min: 0, max: 360, step: 1 },
  });

  useEffect(() => {
    if (!game) return;
    setGoalPlacement({ x: placement.x, z: placement.y, rotation: spin });
  }, [game, placement.x, placement.y, spin, setGoalPlacement]);

  const labelPosition = usePoiPresentation({ ref, map, isHinted, isActive });

  const focusHere = () => {
    const center = boundingBoxCenter(ref.current);
    const coordinate = vector3ToCoords([center.x, 0, center.z], COORDS);
    setFocus(name, {
      longitude: coordinate.longitude,
      latitude: coordinate.latitude,
      zoom,
      pitch,
      bearing,
    });
  };

  const toggle = (event: MouseEvent) => {
    event.stopPropagation();
    if (isActive) {
      clear();
      return;
    }
    focusHere();
  };

  useEffect(() => {
    if (isActive) focusHere();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, pitch, bearing]);

  const onModelClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
  };

  return (
    <group position={[placement.x, 0, placement.y]}>
      <primitive
        object={scene}
        ref={ref}
        onClick={onModelClick}
        rotation={[0, (spin * Math.PI) / 180, 0]}
      />
      {!(isActive && playing) && (
        <Html position={labelPosition} center>
          <button
            onClick={toggle}
            className="c-point-of-interest__label"
            data-active={isActive || undefined}
            data-hint={isHinted || undefined}
          >
            {isActive ? "← Back" : name}
          </button>
        </Html>
      )}
    </group>
  );
}

export default PointOfInterest;
