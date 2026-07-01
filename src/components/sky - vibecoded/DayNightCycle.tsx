import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";
import { useControls } from "leva";

// Colors for the sky at different times. Interpolated by how high the sun is.
const DAY = { sky: "#87ceeb", horizon: "#cfe8ff", fog: "#eaf6ff" };
const NIGHT = { sky: "#0b1026", horizon: "#1b2540", fog: "#0e1630" };
const DUSK = { sky: "#f6a15a", horizon: "#ff8c42", fog: "#ffb27a" }; // sunrise/sunset

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function lerpHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp((pa >> 16) & 255, (pb >> 16) & 255, t));
  const g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t));
  const bl = Math.round(lerp(pa & 255, pb & 255, t));
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
}

function DayNightCycle() {
  const { current: mapRef } = useMap();

  const { autoplay, hour, dayLength } = useControls("Sky", {
    autoplay: true,
    hour: { value: 12, min: 0, max: 24, step: 0.1 },
    dayLength: { value: 60, min: 5, max: 600, step: 5 }, // seconds for a full day
  });

  const timeRef = useRef(hour);
  useEffect(() => {
    timeRef.current = hour; // follow the slider when the user drags it
  }, [hour]);

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    const apply = (h: number) => {
      if (!map.isStyleLoaded()) return;
      // sun elevation: 0 at 6h, 1 at noon, 0 at 18h, negative at night
      const elevation = Math.sin(((h - 6) / 12) * Math.PI);
      const day = Math.max(0, elevation); // 0 = night, 1 = midday
      const twilight = Math.max(0, 1 - Math.abs(elevation) * 3); // peaks near horizon

      const sky = lerpHex(
        lerpHex(NIGHT.sky, DAY.sky, day),
        DUSK.sky,
        twilight * 0.6,
      );
      const horizon = lerpHex(
        lerpHex(NIGHT.horizon, DAY.horizon, day),
        DUSK.horizon,
        twilight * 0.7,
      );
      const fog = lerpHex(
        lerpHex(NIGHT.fog, DAY.fog, day),
        DUSK.fog,
        twilight * 0.5,
      );

      // Built-in MapLibre sky (visible when the map is tilted).
      map.setSky({
        "sky-color": sky,
        "horizon-color": horizon,
        "fog-color": fog,
        "sky-horizon-blend": 0.6,
        "horizon-fog-blend": 0.6,
        "fog-ground-blend": 0.4,
        "atmosphere-blend": 0.8,
      });

      // Built-in MapLibre light drives the 3D buildings (sun position + color).
      map.setLight({
        anchor: "map",
        position: [1.2, (h / 24) * 360, 90 - day * 85],
        color: lerpHex("#20304f", "#fff4e0", day),
        intensity: 0.15 + day * 0.5,
      });
    };

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (autoplay) {
        timeRef.current = (timeRef.current + (24 / dayLength) * dt) % 24;
      }
      apply(timeRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mapRef, autoplay, dayLength]);

  return null;
}

export default DayNightCycle;
