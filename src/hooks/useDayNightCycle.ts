import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { useControls } from "leva";
import { Color, NoColorSpace } from "three";

import { useWeatherStore } from "../store/weatherStore";
import { dayNight } from "../lib/dayNight";

const DAY = { sky: "#87ceeb", horizon: "#cfe8ff", fog: "#eaf6ff" };
const NIGHT = { sky: "#0b1026", horizon: "#1b2540", fog: "#0e1630" };
const DUSK = { sky: "#f6a15a", horizon: "#ff8c42", fog: "#ffb27a" };
const CLOUDY = { sky: "#8a93a3", horizon: "#9aa3b2", fog: "#aeb6c2" };

// Scratch colors reused across calls — NoColorSpace keeps this a plain,
// gamma-free channel mix (no sRGB/linear conversion), matching a straight
// 0-255 blend of the two hex colors.
const mixed = new Color();
const target = new Color();

function lerpHex(startHex: string, endHex: string, amount: number) {
  mixed.setStyle(startHex, NoColorSpace);
  target.setStyle(endHex, NoColorSpace);
  mixed.lerp(target, amount);
  return `#${mixed.getHexString(NoColorSpace)}`;
}

function blend(
  night: string,
  day: string,
  dusk: string,
  cloudy: string,
  dayAmount: number,
  twilight: number,
  gloom: number,
) {
  return lerpHex(lerpHex(lerpHex(night, day, dayAmount), dusk, twilight), cloudy, gloom);
}

const currentLocalHour = () => {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
};

export function useDayNightCycle(mapRef: RefObject<MapRef | null>) {
  const weather = useWeatherStore((state) => state.weather);

  const { daynight: mode, hour } = useControls("Weather", {
    daynight: {
      value: "auto",
      options: ["auto", "manual"],
      label: "day / night",
    },
    hour: {
      value: 12,
      min: 0,
      max: 24,
      step: 0.1,
      render: (get) => get("Weather.daynight") === "manual",
    },
  });

  const modeRef = useRef(mode);
  modeRef.current = mode;
  const hourRef = useRef(hour);
  hourRef.current = hour;
  const weatherRef = useRef(weather);
  weatherRef.current = weather;

  useEffect(() => {
    const updateSky = (hourOfDay: number) => {
      const elevation = Math.sin(((hourOfDay - 6) / 12) * Math.PI);
      const dayAmount = Math.max(0, elevation);
      const twilight = Math.max(0, 1 - Math.abs(elevation) * 3);

      const current = weatherRef.current;
      const gloom = current?.isThunder
        ? 0.85
        : Math.min(current?.cloudCover ?? 0, 1) * 0.6;

      // Publish so the R3F scene lights can darken with the sky.
      dayNight.dayAmount = dayAmount;
      dayNight.gloom = gloom;

      const map = mapRef.current?.getMap();
      if (!map || !map.isStyleLoaded()) return;

      map.setSky({
        "sky-color": blend(NIGHT.sky, DAY.sky, DUSK.sky, CLOUDY.sky, dayAmount, twilight * 0.6, gloom),
        "horizon-color": blend(NIGHT.horizon, DAY.horizon, DUSK.horizon, CLOUDY.horizon, dayAmount, twilight * 0.7, gloom),
        "fog-color": blend(NIGHT.fog, DAY.fog, DUSK.fog, CLOUDY.fog, dayAmount, twilight * 0.5, gloom),
        "sky-horizon-blend": 0.6,
        "horizon-fog-blend": 0.6,
        "fog-ground-blend": 0.4,
        "atmosphere-blend": 0.8,
      });

      map.setLight({
        anchor: "map",
        position: [1.2, (hourOfDay / 24) * 360, 90 - dayAmount * 85],
        color: lerpHex("#20304f", "#fff4e0", dayAmount),
        intensity: (0.15 + dayAmount * 0.5) * (1 - gloom * 0.5),
      });
    };

    let animationFrameId = 0;
    const animate = () => {
      const hourOfDay =
        modeRef.current === "auto" ? currentLocalHour() : hourRef.current;
      updateSky(hourOfDay);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mapRef]);
}
