import type { Map } from "maplibre-gl";
import { coordsToVector3 } from "react-three-map/maplibre";

import { COORDS } from "../constants";

export function toScene(longitude: number, latitude: number): [number, number] {
  const [x, , z] = coordsToVector3({ longitude, latitude }, COORDS);
  return [x, z];
}

export function sceneCenter(map: Map): [number, number] {
  const { lng, lat } = map.getCenter();
  return toScene(lng, lat);
}
