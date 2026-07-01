import { useEffect } from "react";
import { useMap } from "react-three-map/maplibre";

import { useWeatherStore } from "../store/weatherStore";

// Re-check the weather this often so it changes over time on its own.
const REFRESH_MILLISECONDS = 2 * 60 * 1000; // every 2 minutes

// Round so tiny pans don't spam the weather API (~1 km resolution).
const roundCoordinate = (value: number) => Math.round(value * 100) / 100;

// Keeps the weather store up to date for wherever the map is looking. The
// fetching itself lives in the store (refresh); this hook only owns the
// map-event wiring, which can't live in a plain store. Call it once from a
// component inside the <Canvas> (e.g. Experience).
export function useWeatherUpdater() {
  const map = useMap();
  const refresh = useWeatherStore((state) => state.refresh);

  useEffect(() => {
    const update = () => {
      const center = map.getCenter();
      refresh(roundCoordinate(center.lat), roundCoordinate(center.lng));
    };

    update(); // fetch straight away
    map.on("moveend", update); // and whenever you stop panning
    const refreshTimer = setInterval(update, REFRESH_MILLISECONDS);

    return () => {
      map.off("moveend", update);
      clearInterval(refreshTimer);
    };
  }, [map, refresh]);
}
