import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useMap } from "react-three-map/maplibre";
import { useControls } from "leva";

import { useWeatherStore } from "../../store/weatherStore";
import { useMapStore } from "../../store/mapStore";
import { dayNight } from "../../lib/dayNight";

// A cheap low mist: a few dozen wide, flat, translucent blobs drifting just
// above the ground. Unlit + overlapping, so it reads as a soft ground fog.
const PUFFS = 44;
const MIN_Y = 0.3;
const MAX_Y = 3;
const DRIFT = 1.5; // metres/sec

const DAY_MIST = new THREE.Color("#e2e8ef");
const NIGHT_MIST = new THREE.Color("#222b3d");

interface Puff {
  x: number; // normalized [-0.5, 0.5] across the box
  z: number;
  y: number;
  radius: number; // wide flat blob
}

function makePuffs(): Puff[] {
  return Array.from({ length: PUFFS }, () => ({
    x: Math.random() - 0.5,
    z: Math.random() - 0.5,
    y: MIN_Y + Math.random() * (MAX_Y - MIN_Y),
    radius: 9 + Math.random() * 12,
  }));
}

function wrapUnit(value: number) {
  if (value > 0.5) return value - 1;
  if (value < -0.5) return value + 1;
  return value;
}

const puffTransform = new THREE.Object3D();

function GroundMist() {
  const map = useMap();
  const weather = useWeatherStore((state) => state.weather);
  const mode = useWeatherStore((state) => state.mode);
  const boxArea = useMapStore((state) => state.boxArea);

  const { showFog, fogOverride, fogIntensity } = useControls("Weather", {
    showFog: { value: true, label: "fog" },
    fogOverride: {
      value: -1,
      min: -1,
      max: 1,
      step: 0.05,
      label: "amount of fog",
      render: (get) => get("Weather.showFog"),
    },
    fogIntensity: {
      value: 0.22,
      min: 0,
      max: 0.6,
      step: 0.01,
      label: "fog intensity",
      render: (get) => get("Weather.showFog"),
    },
  });

  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null!);

  const puffsRef = useRef<Puff[] | null>(null);
  if (!puffsRef.current) puffsRef.current = makePuffs();
  const puffs = puffsRef.current;

  // fog: -1 = auto from the forecast (fog code, or heavy overcast), else forced.
  // There's no forced "fog" mode — fog only ever comes from the real forecast
  // or this override slider.
  const cover = weather?.cloudCover ?? 0;
  const autoAmount = weather?.isFog ? 1 : mode === "auto" && cover >= 0.9 ? 0.5 : 0;
  const amount = fogOverride >= 0 ? fogOverride : autoAmount;
  const active = showFog && amount > 0.01;

  useEffect(() => {
    meshRef.current.count = active ? PUFFS : 0;
    map.triggerRepaint();
  }, [active, map]);

  useFrame((_state, deltaSeconds) => {
    if (!active || !boxArea) return;

    groupRef.current.position.set(boxArea.x, 0, boxArea.z);
    materialRef.current.opacity = amount * fogIntensity;
    materialRef.current.color.copy(NIGHT_MIST).lerp(DAY_MIST, dayNight.dayAmount);

    const mesh = meshRef.current;
    for (let index = 0; index < PUFFS; index++) {
      const puff = puffs[index];
      puff.x = wrapUnit(puff.x + (DRIFT / boxArea.width) * deltaSeconds);
      puffTransform.position.set(
        puff.x * boxArea.width,
        puff.y,
        puff.z * boxArea.length,
      );
      // Wide and flat so it hugs the ground.
      puffTransform.scale.set(puff.radius, puff.radius * 0.25, puff.radius);
      puffTransform.updateMatrix();
      mesh.setMatrixAt(index, puffTransform.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    map.triggerRepaint();
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, PUFFS]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial
          ref={materialRef}
          color="#e2e8ef"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}

export default GroundMist;
