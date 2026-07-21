import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import type { useMap } from "react-three-map/maplibre";

import { ballEntered } from "../lib/goalPhysics";

export type Aim = { from: [number, number, number]; to: [number, number, number] };

interface UseAimAndShootArgs {
  map: ReturnType<typeof useMap>;
  ballRef: RefObject<RapierRigidBody>;
  ballMeshRef: RefObject<THREE.Mesh>;
  playing: boolean;
  startGame: () => void;
  setAiming: (value: boolean) => void;
  spawnY: number;
  kick: number;
  maxPull: number;
}

export function useAimAndShoot({
  map,
  ballRef,
  ballMeshRef,
  playing,
  startGame,
  setAiming,
  spawnY,
  kick,
  maxPull,
}: UseAimAndShootArgs) {
  const draggingRef = useRef(false);
  const scoredRef = useRef(false);
  const [aim, setAim] = useState<Aim | null>(null);

  const ballWorld = () => {
    const point = new THREE.Vector3();
    ballMeshRef.current.getWorldPosition(point);
    return point;
  };

  const setCursor = (value: string) => {
    const canvas = map.getCanvas();
    if (canvas) canvas.style.cursor = value;
  };

  const startDrag = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    draggingRef.current = true;
    scoredRef.current = false;
    setAiming(true);
    const from = ballWorld();
    setAim({ from: [from.x, spawnY, from.z], to: [from.x, spawnY, from.z] });
  };

  const onBallDown = (event: ThreeEvent<PointerEvent>) => {
    if (!playing) {
      event.stopPropagation();
      startGame();
      return;
    }
    startDrag(event);
  };

  const moveDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!draggingRef.current) return;
    setAim((current) =>
      current
        ? { from: current.from, to: [event.point.x, spawnY, event.point.z] }
        : current,
    );
  };

  const endDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setAim(null);
    setAiming(false);

    const from = ballWorld();
    const direction = new THREE.Vector3(
      event.point.x - from.x,
      0,
      event.point.z - from.z,
    );
    const distance = direction.length();
    if (distance < 0.05) return;
    const strength = Math.min(distance, maxPull) / maxPull;
    direction.normalize().multiplyScalar(strength * kick);
    ballRef.current.applyImpulse({ x: direction.x, y: 0, z: direction.z }, true);
  };

  useEffect(() => {
    const stop = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setAim(null);
      setAiming(false);
    };
    window.addEventListener("pointerup", stop);
    return () => window.removeEventListener("pointerup", stop);
  }, [setAiming]);

  const registerGoal = (
    payload: { other: { rigidBodyObject?: THREE.Object3D | null } },
    score: () => void,
  ) => {
    if (!playing || scoredRef.current || !ballEntered(payload)) return;
    scoredRef.current = true;
    score();
  };

  return { aim, onBallDown, moveDrag, endDrag, registerGoal, setCursor };
}
