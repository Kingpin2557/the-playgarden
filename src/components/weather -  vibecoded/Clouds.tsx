import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useMap, coordsToVector3 } from "react-three-map/maplibre";
import { useControls } from "leva";

import { COORDS } from "../../coords";
import { useWeatherStore } from "../../store/weatherStore";

// ---- Tweak the clouds ----
const MAX_CLOUDS = 12; // most clouds visible at full overcast
const PUFFS_PER_CLOUD = 5; // low-poly blobs that make up one cloud
const ALTITUDE = 80; // how high the clouds sit (m)
const AREA = 300; // how far clouds spread around you (m)
const DRIFT_SPEED = 3; // base drift speed (m/s)
const THRESHOLD = 0.6; // only show clouds once the sky is this covered (0..1)
// --------------------------

interface CloudPuff {
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  radius: number;
}

interface Cloud {
  x: number;
  z: number;
  scale: number;
  puffs: CloudPuff[];
}

// Build the cloud shapes once (a position plus the blobs that make each cloud).
function makeClouds(): Cloud[] {
  const clouds: Cloud[] = [];
  for (let cloudIndex = 0; cloudIndex < MAX_CLOUDS; cloudIndex++) {
    const puffs: CloudPuff[] = [];
    for (let puffIndex = 0; puffIndex < PUFFS_PER_CLOUD; puffIndex++) {
      puffs.push({
        offsetX: (Math.random() - 0.5) * 12,
        offsetY: (Math.random() - 0.5) * 3,
        offsetZ: (Math.random() - 0.5) * 8,
        radius: 2 + Math.random() * 3,
      });
    }
    clouds.push({
      x: (Math.random() - 0.5) * AREA,
      z: (Math.random() - 0.5) * AREA,
      scale: 0.8 + Math.random() * 0.8,
      puffs,
    });
  }
  return clouds;
}

const puffTransform = new THREE.Object3D(); // reused to build each puff's matrix

function Clouds() {
  const map = useMap();
  const weather = useWeatherStore((state) => state.weather);

  // coverOverride: -1 uses the live weather, 0..1 forces a coverage for testing.
  const { coverOverride } = useControls("Clouds", {
    coverOverride: { value: -1, min: -1, max: 1, step: 0.05 },
  });

  const groupRef = useRef<THREE.Group>(null!);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);

  const cloudShapes = useRef<Cloud[] | null>(null);
  if (!cloudShapes.current) cloudShapes.current = makeClouds();
  const clouds = cloudShapes.current;

  const coverage =
    coverOverride >= 0 ? coverOverride : (weather?.cloudCover ?? 0);
  // Nothing below the threshold; above it, ramp from 0 up to full.
  const cloudiness =
    coverage < THRESHOLD ? 0 : (coverage - THRESHOLD) / (1 - THRESHOLD);
  const activeCloudCount = Math.round(MAX_CLOUDS * cloudiness);

  const windAngleRadians = ((weather?.windDirection ?? 0) * Math.PI) / 180;
  const windMultiplier = 1 + (weather?.windSpeed ?? 0) / 20;
  const driftX = Math.sin(windAngleRadians) * DRIFT_SPEED * windMultiplier;
  const driftZ = Math.cos(windAngleRadians) * DRIFT_SPEED * windMultiplier;

  useEffect(() => {
    instancedMeshRef.current.count = activeCloudCount * PUFFS_PER_CLOUD;
    map.triggerRepaint();
  }, [activeCloudCount, map]);

  useFrame((_state, deltaSeconds) => {
    if (activeCloudCount === 0) return; // clear sky: nothing to draw

    // Keep the clouds above the map center (where you're looking).
    const center = map.getCenter();
    const [centerX, , centerZ] = coordsToVector3(
      { longitude: center.lng, latitude: center.lat },
      { longitude: COORDS.longitude, latitude: COORDS.latitude },
    );
    groupRef.current.position.set(centerX, ALTITUDE, centerZ);

    // White clouds, greyer when overcast, dark when thundering.
    const shade = weather?.isThunder ? 0.4 : 1 - coverage * 0.35;
    materialRef.current.color.setScalar(shade);

    const instancedMesh = instancedMeshRef.current;
    let puffMatrixIndex = 0;
    for (let cloudIndex = 0; cloudIndex < activeCloudCount; cloudIndex++) {
      const cloud = clouds[cloudIndex];
      cloud.x += driftX * deltaSeconds;
      cloud.z += driftZ * deltaSeconds;
      if (cloud.x > AREA / 2) cloud.x -= AREA;
      if (cloud.x < -AREA / 2) cloud.x += AREA;
      if (cloud.z > AREA / 2) cloud.z -= AREA;
      if (cloud.z < -AREA / 2) cloud.z += AREA;

      for (const puff of cloud.puffs) {
        puffTransform.position.set(
          cloud.x + puff.offsetX * cloud.scale,
          puff.offsetY * cloud.scale,
          cloud.z + puff.offsetZ * cloud.scale,
        );
        puffTransform.scale.setScalar(puff.radius * cloud.scale);
        puffTransform.updateMatrix();
        instancedMesh.setMatrixAt(puffMatrixIndex, puffTransform.matrix);
        puffMatrixIndex++;
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
