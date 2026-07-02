import { useEffect } from "react";
import { useMap } from "react-three-map/maplibre";

import { useWeatherStore } from "../store/weatherStore";

const REFRESH_MILLISECONDS = 2 * 60 * 1000;
const round = (value: number) => Math.round(value * 100) / 100;

export function useWeatherUpdater() {
  const map = useMap();
  const refresh = useWeatherStore((state) => state.refresh);

  useEffect(() => {
    const update = () => {
      const center = map.getCenter();
      refresh(round(center.lat), round(center.lng));
    };

    update();
    map.on("moveend", update);
    const timer = setInterval(update, REFRESH_MILLISECONDS);

    return () => {
      map.off("moveend", update);
      clearInterval(timer);
    };
  }, [map, refresh]);
}
