import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useMap } from "react-three-map/maplibre";
import { useControls } from "leva";

import { useWeatherStore } from "../../store/weatherStore";
import { useMapStore } from "../../store/mapStore";

const MAX_CLOUDS = 12;
const PUFFS_PER_CLOUD = 5;
const ALTITUDE = 80;
const DRIFT_SPEED = 3;
const THRESHOLD = 0.6;

interface Puff {
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  radius: number;
}

interface Cloud {
  x: number; // normalized [-0.5, 0.5] across the box, scaled at draw time
  z: number;
  scale: number;
  puffs: Puff[];
}

function makeClouds(): Cloud[] {
  return Array.from({ length: MAX_CLOUDS }, () => ({
    x: Math.random() - 0.5,
    z: Math.random() - 0.5,
    scale: 0.8 + Math.random() * 0.8,
    puffs: Array.from({ length: PUFFS_PER_CLOUD }, () => ({
      offsetX: (Math.random() - 0.5) * 12,
      offsetY: (Math.random() - 0.5) * 3,
      offsetZ: (Math.random() - 0.5) * 8,
      radius: 2 + Math.random() * 3,
    })),
  }));
}

// Keep a normalized coordinate within [-0.5, 0.5] as clouds drift off one edge.
function wrapUnit(value: number) {
  if (value > 0.5) return value - 1;
  if (value < -0.5) return value + 1;
  return value;
}

const puffTransform = new THREE.Object3D();

function Clouds() {
  const map = useMap();
  const weather = useWeatherStore((state) => state.weather);
  const boxArea = useMapStore((state) => state.boxArea);

  const { coverOverride } = useControls("Weather", {
    coverOverride: { value: -1, min: -1, max: 1, step: 0.05, label: "cloud cover" },
  });

  const groupRef = useRef<THREE.Group>(null!);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);

  const cloudsRef = useRef<Cloud[] | null>(null);
  if (!cloudsRef.current) cloudsRef.current = makeClouds();
  const clouds = cloudsRef.current;

  const coverage =
    coverOverride >= 0 ? coverOverride : (weather?.cloudCover ?? 0);
  const cloudiness =
    coverage < THRESHOLD ? 0 : (coverage - THRESHOLD) / (1 - THRESHOLD);
  const activeCloudCount = Math.round(MAX_CLOUDS * cloudiness);

  const windAngle = ((weather?.windDirection ?? 0) * Math.PI) / 180;
  const windSpeed = DRIFT_SPEED * (1 + (weather?.windSpeed ?? 0) / 20);
  const driftX = Math.sin(windAngle) * windSpeed;
  const driftZ = Math.cos(windAngle) * windSpeed;

  useEffect(() => {
    instancedMeshRef.current.count = activeCloudCount * PUFFS_PER_CLOUD;
    map.triggerRepaint();
  }, [activeCloudCount, map]);

  useFrame((_state, deltaSeconds) => {
    if (activeCloudCount === 0 || !boxArea) return;

    // Hover over the pan box centre, spread across its width/length.
    groupRef.current.position.set(boxArea.x, ALTITUDE, boxArea.z);

    materialRef.current.color.setScalar(
      weather?.isThunder ? 0.4 : 1 - coverage * 0.35,
    );

    const instancedMesh = instancedMeshRef.current;
    let puffIndex = 0;
    for (let index = 0; index < activeCloudCount; index++) {
      const cloud = clouds[index];
      cloud.x = wrapUnit(cloud.x + (driftX / boxArea.width) * deltaSeconds);
      cloud.z = wrapUnit(cloud.z + (driftZ / boxArea.length) * deltaSeconds);

      const cloudX = cloud.x * boxArea.width;
      const cloudZ = cloud.z * boxArea.length;
      for (const puff of cloud.puffs) {
        puffTransform.position.set(
          cloudX + puff.offsetX * cloud.scale,
          puff.offsetY * cloud.scale,
          cloudZ + puff.offsetZ * cloud.scale,
        );
        puffTransform.scale.setScalar(puff.radius * cloud.scale);
        puffTransform.updateMatrix();
        instancedMesh.setMatrixAt(puffIndex, puffTransform.matrix);
        puffIndex++;
      }
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    map.triggerRepaint();
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, MAX_CLOUDS * PUFFS_PER_CLOUD]}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#ffffff"
          flatShading
          roughness={1}
        />
      </instancedMesh>
    </group>
  );
}

export default Clouds;
