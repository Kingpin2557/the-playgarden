import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import gsap from "gsap";

import { usePoiStore, type FocusTarget } from "../store/poiStore";

export function useCameraFocus(mapRef: RefObject<MapRef | null>) {
  const focus = usePoiStore((state) => state.focus);
  const homeView = useRef<FocusTarget | null>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const readCamera = (): FocusTarget => ({
      longitude: map.getCenter().lng,
      latitude: map.getCenter().lat,
      zoom: map.getZoom(),
      pitch: map.getPitch(),
      bearing: map.getBearing(),
    });

    if (focus && !homeView.current) homeView.current = readCamera();

    const target = focus ?? homeView.current;
    if (!target) return;

    const proxy = readCamera();
    tween.current?.kill();
    tween.current = gsap.to(proxy, {
      ...target,
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

    return () => {
      tween.current?.kill();
    };
  }, [focus, mapRef]);
}
