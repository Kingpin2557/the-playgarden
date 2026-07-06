import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Map, MapLibreEvent } from "maplibre-gl";
import type { MapRef } from "react-map-gl/maplibre";
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

// How far you can swivel (degrees, total arc) around a focused PoI's bearing.
const ROTATE_ARC = 80;

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

  const focusRef = useRef(focus);
  focusRef.current = focus;

  const homeView = useRef<CameraView | null>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    if (focus && !homeView.current) homeView.current = readCamera(map);

    // focus already carries longitude/latitude/zoom/pitch/bearing per PoI.
    const view = focus ?? homeView.current;
    if (!view) return;

    animateCamera(map, view, tween);
    return () => {
      tween.current?.kill();
    };
  }, [focus, mapRef]);

  // Limit the horizontal rotation to a small arc around the PoI's bearing,
  // but only for user drags while a PoI is focused.
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const clampBearing = (event: MapLibreEvent) => {
      const focused = focusRef.current;
      if (!focused || !event.originalEvent) return;
      const limit = ROTATE_ARC / 2;
      const offset = normalizeAngle(map.getBearing() - focused.bearing);
      const clamped = Math.max(-limit, Math.min(limit, offset));
      if (Math.abs(clamped - offset) > 0.01) {
        map.setBearing(focused.bearing + clamped);
      }
    };

    map.on("rotate", clampBearing);
    return () => {
      map.off("rotate", clampBearing);
    };
  }, [mapRef]);
}
