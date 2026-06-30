import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useMap } from "react-three-map/maplibre";
import { useControls } from "leva";

import { COORDS } from "../../coords";
import { useWeather } from "./useWeather";

const MAX = 4000; // pool size: most drops/flakes that can be on screen at once

// Look of each weather type. scale = shape of one particle [x, y, z] in meters.
// Rain = tall thin streak, snow = small cube. color/opacity tune the cartoon look.
const RAIN = { speed: 40, scale: [0.06, 1.4, 0.06], color: "#dfe8ff", opacity: 0.9 };
const SNOW = { speed: 8, scale: [0.25, 0.25, 0.25], color: "#ffffff", opacity: 1 };

const dummy = new THREE.Object3D(); // reused to build each particle's matrix

function WeatherParticles() {
  const map = useMap();
  const weather = useWeather(COORDS.latitude, COORDS.longitude);

  // Live controls. "mode": auto uses the live weather, rain/snow force a type.
  const { mode, spread, height } = useControls("Weather", {
    mode: { value: "auto", options: ["auto", "rain", "snow"] },
    spread: { value: 120, min: 1, max: 600, step: 1 },
    height: { value: 50, min: 1, max: 300, step: 1 },
  });

  const meshRef = useRef<THREE.InstancedMesh>(null!);

  // Build each particle's position + per-particle speed variation once.
  const buffer = useRef<{ positions: Float32Array; speeds: Float32Array } | null>(null);
  if (!buffer.current) {
    const positions = new Float32Array(MAX * 3);
    const speeds = new Float32Array(MAX);
    for (let i = 0; i < MAX; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = Math.random() * height;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      speeds[i] = 0.7 + Math.random() * 0.6;
    }
    buffer.current = { positions, speeds };
  }
  const data = buffer.current;

  // Turn the weather into how the particles behave.
  const isSnow = mode === "snow" || (mode === "auto" && !!weather?.isSnow);
  const kind = isSnow ? SNOW : RAIN;
  const intensity =
    mode === "auto" ? Math.min((weather?.precipitation ?? 0) / 5, 1) : 1; // 0..1
  const active = Math.floor(MAX * intensity); // how many particles to show

  const windRad = ((weather?.windDirection ?? 0) * Math.PI) / 180;
  const windSpeed = (weather?.windSpeed ?? 0) / 5;
  const windX = Math.sin(windRad) * windSpeed;
  const windZ = Math.cos(windRad) * windSpeed;

  // Show only the active particles, and wake the map up so it starts rendering.
  useEffect(() => {
    meshRef.current.count = active;
    map.triggerRepaint();
  }, [active, map]);

  useFrame((_, delta) => {
    if (active === 0) return; // dry weather: nothing to animate
    const mesh = meshRef.current;
    for (let i = 0; i < active; i++) {
      data.positions[i * 3 + 1] -= kind.speed * data.speeds[i] * delta; // fall
      data.positions[i * 3] += windX * delta; // drift with wind
      data.positions[i * 3 + 2] += windZ * delta;
      if (data.positions[i * 3 + 1] < 0) {
        // recycle: send it back up to a fresh spot
        data.positions[i * 3 + 1] = height;
        data.positions[i * 3] = (Math.random() - 0.5) * spread;
        data.positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      }
      dummy.position.set(
        data.positions[i * 3],
        data.positions[i * 3 + 1],
        data.positions[i * 3 + 2],
      );
      dummy.scale.set(kind.scale[0], kind.scale[1], kind.scale[2]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    map.triggerRepaint(); // the map only redraws on demand, so ask it to
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color={kind.color}
        transparent
        opacity={kind.opacity}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

export default WeatherParticles;
