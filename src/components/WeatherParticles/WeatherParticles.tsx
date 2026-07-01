import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useMap, coordsToVector3 } from "react-three-map/maplibre";
import { useControls } from "leva";

import { COORDS } from "../../coords";
import { useWeatherStore } from "../../store/weatherStore";

const MAX_PARTICLES = 800; // most drops/flakes on screen at once

// Look of each weather type. scale = shape of one particle [x, y, z] in meters.
// Rain = tall thin streak, snow = small cube.
const RAIN = {
  fallSpeed: 40,
  scale: [0.06, 1.4, 0.06],
  color: "#dfe8ff",
  opacity: 0.9,
};
const SNOW = {
  fallSpeed: 8,
  scale: [0.25, 0.25, 0.25],
  color: "#ffffff",
  opacity: 1,
};

const particleTransform = new THREE.Object3D(); // reused to build each matrix

function WeatherParticles() {
  const map = useMap();
  const weather = useWeatherStore((state) => state.weather);

  // Live controls. "mode": auto uses the live weather, rain/snow force a type.
  const { mode, spread, height } = useControls("Weather", {
    mode: { value: "auto", options: ["auto", "rain", "snow"] },
    spread: { value: 40, min: 1, max: 200, step: 1 },
    height: { value: 30, min: 1, max: 150, step: 1 },
  });

  const groupRef = useRef<THREE.Group>(null!); // moved to follow the view
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);

  // Build each particle's start position + a small speed variation, once.
  const particleData = useRef<{
    positions: Float32Array;
    fallSpeeds: Float32Array;
  } | null>(null);
  if (!particleData.current) {
    const positions = new Float32Array(MAX_PARTICLES * 3);
    const fallSpeeds = new Float32Array(MAX_PARTICLES);
    for (let index = 0; index < MAX_PARTICLES; index++) {
      positions[index * 3] = (Math.random() - 0.5) * spread;
      positions[index * 3 + 1] = Math.random() * height;
      positions[index * 3 + 2] = (Math.random() - 0.5) * spread;
      fallSpeeds[index] = 0.7 + Math.random() * 0.6;
    }
    particleData.current = { positions, fallSpeeds };
  }
  const { positions, fallSpeeds } = particleData.current;

  // Turn the weather into how the particles look and behave.
  const isSnow = mode === "snow" || (mode === "auto" && !!weather?.isSnow);
  const appearance = isSnow ? SNOW : RAIN;
  const intensity =
    mode === "auto" ? Math.min((weather?.precipitation ?? 0) / 5, 1) : 1;
  const activeCount = Math.floor(MAX_PARTICLES * intensity);

  const windAngleRadians = ((weather?.windDirection ?? 0) * Math.PI) / 180;
  const windStrength = (weather?.windSpeed ?? 0) / 5;
  const windDriftX = Math.sin(windAngleRadians) * windStrength;
  const windDriftZ = Math.cos(windAngleRadians) * windStrength;

  // Show only the active particles, and wake the map up so it starts rendering.
  useEffect(() => {
    instancedMeshRef.current.count = activeCount;
    map.triggerRepaint();
  }, [activeCount, map]);

  useFrame((_state, deltaSeconds) => {
    if (activeCount === 0) return; // dry weather: nothing to animate

    // Keep the rain box under the map center (where you're looking).
    const center = map.getCenter();
    const [centerX, , centerZ] = coordsToVector3(
      { longitude: center.lng, latitude: center.lat },
      { longitude: COORDS.longitude, latitude: COORDS.latitude },
    );
    groupRef.current.position.set(centerX, 0, centerZ);

    const instancedMesh = instancedMeshRef.current;
    for (let index = 0; index < activeCount; index++) {
      positions[index * 3 + 1] -=
        appearance.fallSpeed * fallSpeeds[index] * deltaSeconds;
      positions[index * 3] += windDriftX * deltaSeconds;
      positions[index * 3 + 2] += windDriftZ * deltaSeconds;
      if (positions[index * 3 + 1] < 0) {
        // recycle: send it back up to a fresh spot
        positions[index * 3 + 1] = height;
        positions[index * 3] = (Math.random() - 0.5) * spread;
        positions[index * 3 + 2] = (Math.random() - 0.5) * spread;
      }
      particleTransform.position.set(
        positions[index * 3],
        positions[index * 3 + 1],
        positions[index * 3 + 2],
      );
      particleTransform.scale.set(
        appearance.scale[0],
        appearance.scale[1],
        appearance.scale[2],
      );
      particleTransform.updateMatrix();
      instancedMesh.setMatrixAt(index, particleTransform.matrix);
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    map.triggerRepaint(); // the map only redraws on demand, so ask it to
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, MAX_PARTICLES]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color={appearance.color}
          transparent
          opacity={appearance.opacity}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}

export default WeatherParticles;
