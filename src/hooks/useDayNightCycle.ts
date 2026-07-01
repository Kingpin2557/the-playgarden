import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { useControls } from "leva";

// Colors for the sky at different times. Interpolated by how high the sun is.
const DAY = { sky: "#87ceeb", horizon: "#cfe8ff", fog: "#eaf6ff" };
const NIGHT = { sky: "#0b1026", horizon: "#1b2540", fog: "#0e1630" };
const DUSK = { sky: "#f6a15a", horizon: "#ff8c42", fog: "#ffb27a" }; // sunrise/sunset

const lerp = (start: number, end: number, amount: number) =>
  start + (end - start) * amount;

function lerpHex(startHex: string, endHex: string, amount: number) {
  const start = parseInt(startHex.slice(1), 16);
  const end = parseInt(endHex.slice(1), 16);
  const red = Math.round(lerp((start >> 16) & 255, (end >> 16) & 255, amount));
  const green = Math.round(lerp((start >> 8) & 255, (end >> 8) & 255, amount));
  const blue = Math.round(lerp(start & 255, end & 255, amount));
  return `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;
}

// Drives a day/night cycle on the MapLibre map using its built-in sky + light.
// Takes the map ref from <Map> so it can run from the root (no null component).
export function useDayNightCycle(mapRef: RefObject<MapRef | null>) {
  // mode "auto" runs the cycle on its own; "manual" lets you set the hour.
  const { mode, hour, dayLength } = useControls("Sky", {
    mode: { value: "auto", options: ["auto", "manual"] },
    hour: { value: 12, min: 0, max: 24, step: 0.1 },
    dayLength: { value: 60, min: 5, max: 600, step: 5 }, // seconds for a full day
  });

  const currentHour = useRef(hour);
  useEffect(() => {
    currentHour.current = hour; // follow the slider when the user drags it
  }, [hour]);

  useEffect(() => {
    const updateSky = (hourOfDay: number) => {
      const map = mapRef.current?.getMap();
      if (!map || !map.isStyleLoaded()) return;

      // sun elevation: 0 at 6h, 1 at noon, 0 at 18h, negative at night
      const elevation = Math.sin(((hourOfDay - 6) / 12) * Math.PI);
      const dayAmount = Math.max(0, elevation); // 0 = night, 1 = midday
      const twilightAmount = Math.max(0, 1 - Math.abs(elevation) * 3); // near horizon

      const skyColor = lerpHex(
        lerpHex(NIGHT.sky, DAY.sky, dayAmount),
        DUSK.sky,
        twilightAmount * 0.6,
      );
      const horizonColor = lerpHex(
        lerpHex(NIGHT.horizon, DAY.horizon, dayAmount),
        DUSK.horizon,
        twilightAmount * 0.7,
      );
      const fogColor = lerpHex(
        lerpHex(NIGHT.fog, DAY.fog, dayAmount),
        DUSK.fog,
        twilightAmount * 0.5,
      );

      // Built-in MapLibre sky (visible when the map is tilted).
      map.setSky({
        "sky-color": skyColor,
        "horizon-color": horizonColor,
        "fog-color": fogColor,
        "sky-horizon-blend": 0.6,
        "horizon-fog-blend": 0.6,
        "fog-ground-blend": 0.4,
        "atmosphere-blend": 0.8,
      });

      // Built-in MapLibre light drives the 3D buildings (sun position + color).
      map.setLight({
        anchor: "map",
        position: [1.2, (hourOfDay / 24) * 360, 90 - dayAmount * 85],
        color: lerpHex("#20304f", "#fff4e0", dayAmount),
        intensity: 0.15 + dayAmount * 0.5,
      });
    };

    let animationFrameId = 0;
    let lastTimestamp = performance.now();
    const animate = (timestamp: number) => {
      const deltaSeconds = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      if (mode === "auto") {
        currentHour.current =
          (currentHour.current + (24 / dayLength) * deltaSeconds) % 24;
      }
      updateSky(currentHour.current);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mapRef, mode, dayLength]);
}
