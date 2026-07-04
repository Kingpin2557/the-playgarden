import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Map, MapLibreEvent } from "maplibre-gl";
import type { MapRef } from "react-map-gl/maplibre";
import { useControls } from "leva";
import gsap from "gsap";

import { usePoiStore } from "../store/poiStore";

interface CameraView {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

function readCamera(map: Map): CameraView {
  const center = map.getCenter();
  return {
    longitude: center.lng,
    latitude: center.lat,
    zoom: map.getZoom(),
    pitch: map.getPitch(),
    bearing: map.getBearing(),
  };
}

function normalizeAngle(angle: number) {
  return ((((angle + 180) % 360) + 360) % 360) - 180;
}

function animateCamera(
  map: Map,
  view: CameraView,
  tween: RefObject<gsap.core.Tween | null>,
) {
  const proxy = readCamera(map);
  tween.current?.kill();
  tween.current = gsap.to(proxy, {
    ...view,
    duration: 1.2,
    ease: "power2.inOut",
    onUpdate: () =>
      map.jumpTo({
        center: [proxy.longitude, proxy.latitude],
        zoom: proxy.zoom,
        pitch: proxy.pitch,
        bearing: proxy.bearing,
      }),
  });
}

export function useCameraFocus(mapRef: RefObject<MapRef | null>) {
  const focus = usePoiStore((state) => state.focus);

  const { zoom, pitch, bearing, rotate } = useControls("Focus", {
    zoom: { value: 21.5, min: 0, max: 25, step: 0.5 },
    pitch: { value: 72, min: 0, max: 80, step: 1 },
    bearing: { value: 253, min: 0, max: 360, step: 1 },
    rotate: { value: 80, min: 0, max: 360, step: 5 },
  });

  const framing = useRef({ zoom, pitch, bearing });
  framing.current = { zoom, pitch, bearing };
  const rotateRef = useRef(rotate);
  rotateRef.current = rotate;
  const focusRef = useRef(focus);
  focusRef.current = focus;

  const homeView = useRef<CameraView | null>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    if (focus && !homeView.current) homeView.current = readCamera(map);

    const view = focus ? { ...focus, ...framing.current } : homeView.current;
    if (!view) return;

    animateCamera(map, view, tween);
    return () => {
      tween.current?.kill();
    };
  }, [focus, mapRef]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !focusRef.current) return;
    animateCamera(map, { ...focusRef.current, zoom, pitch, bearing }, tween);
  }, [zoom, pitch, bearing, mapRef]);

  // Limit the horizontal rotation to a small arc around the focus bearing,
  // but only for user drags while a PoI is focused.
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const clampBearing = (event: MapLibreEvent) => {
      if (!focusRef.current || !event.originalEvent) return;
      const limit = rotateRef.current / 2;
      const offset = normalizeAngle(map.getBearing() - framing.current.bearing);
      const clamped = Math.max(-limit, Math.min(limit, offset));
      if (Math.abs(clamped - offset) > 0.01) {
        map.setBearing(framing.current.bearing + clamped);
      }
    };

    map.on("rotate", clampBearing);
    return () => {
      map.off("rotate", clampBearing);
    };
  }, [mapRef]);
}
