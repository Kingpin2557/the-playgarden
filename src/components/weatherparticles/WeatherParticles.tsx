import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useMap } from "react-three-map/maplibre";
import { useControls } from "leva";

import { useWeatherStore, type WeatherMode } from "../../store/weatherStore";
import { useMapStore } from "../../store/mapStore";

const MAX_PARTICLES = 3000;

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

const particleTransform = new THREE.Object3D();

function WeatherParticles() {
  const map = useMap();
  const weather = useWeatherStore((state) => state.weather);
  const setMode = useWeatherStore((state) => state.setMode);
  const boxArea = useMapStore((state) => state.boxArea);

  // height is the "roof" over the pan box that rain/snow falls from.
  const { mode, height } = useControls("Weather", {
    mode: { value: "auto", options: ["auto", "rain", "snow"] },
    height: { value: 60, min: 10, max: 300, step: 5, label: "roof height" },
  });
  useEffect(() => {
    setMode(mode as WeatherMode);
  }, [mode, setMode]);

  const groupRef = useRef<THREE.Group>(null!);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);

  const particleData = useRef<{
    positions: Float32Array;
    fallSpeeds: Float32Array;
  } | null>(null);
  if (!particleData.current) {
    const positions = new Float32Array(MAX_PARTICLES * 3);
    const fallSpeeds = new Float32Array(MAX_PARTICLES);
    for (let index = 0; index < MAX_PARTICLES; index++) {
      positions[index * 3 + 1] = Math.random() * height;
      fallSpeeds[index] = 0.7 + Math.random() * 0.6;
    }
    particleData.current = { positions, fallSpeeds };
  }
  const { positions, fallSpeeds } = particleData.current;

  const isSnow = mode === "snow" || (mode === "auto" && !!weather?.isSnow);
  const appearance = isSnow ? SNOW : RAIN;
  const intensity =
    mode === "auto" ? Math.min((weather?.precipitation ?? 0) / 5, 1) : 1;
  const activeCount = Math.floor(MAX_PARTICLES * intensity);

  const windAngle = ((weather?.windDirection ?? 0) * Math.PI) / 180;
  const windSpeed = (weather?.windSpeed ?? 0) / 5;
  const windDriftX = Math.sin(windAngle) * windSpeed;
  const windDriftZ = Math.cos(windAngle) * windSpeed;

  useEffect(() => {
    instancedMeshRef.current.count = activeCount;
    map.triggerRepaint();
  }, [activeCount, map]);

  useFrame((_state, deltaSeconds) => {
    if (activeCount === 0 || !boxArea) return;

    // Spawn area = the pan box roof; particles fall straight down onto the park.
    const halfX = boxArea.width / 2;
    const halfZ = boxArea.length / 2;
    groupRef.current.position.set(boxArea.x, 0, boxArea.z);

    const instancedMesh = instancedMeshRef.current;
    for (let index = 0; index < activeCount; index++) {
      positions[index * 3 + 1] -=
        appearance.fallSpeed * fallSpeeds[index] * deltaSeconds;
      positions[index * 3] += windDriftX * deltaSeconds;
      positions[index * 3 + 2] += windDriftZ * deltaSeconds;

      const belowGround = positions[index * 3 + 1] < 0;
      const outsideBox =
        Math.abs(positions[index * 3]) > halfX ||
        Math.abs(positions[index * 3 + 2]) > halfZ;
      if (belowGround || outsideBox) {
        positions[index * 3] = (Math.random() - 0.5) * 2 * halfX;
        positions[index * 3 + 2] = (Math.random() - 0.5) * 2 * halfZ;
        positions[index * 3 + 1] = belowGround
          ? height
          : Math.random() * height;
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
    map.triggerRepaint();
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
