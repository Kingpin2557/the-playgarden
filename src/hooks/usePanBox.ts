import { useEffect, type RefObject } from "react";
import * as THREE from "three";
import { useMap, vector3ToCoords } from "react-three-map/maplibre";
import { useControls } from "leva";

import { COORDS } from "../constants";
import { useMapStore } from "../store/mapStore";

export function usePanBox(surface: RefObject<THREE.Mesh>, rotation: number) {
  const map = useMap();
  const setPanBounds = useMapStore((state) => state.setPanBounds);
  const setBoxArea = useMapStore((state) => state.setBoxArea);

  const { boxWidth, boxLength } = useControls("Map", {
    boxWidth: { value: 180, min: 50, max: 1500, step: 10, label: "box width" },
    boxLength: {
      value: 180,
      min: 50,
      max: 1500,
      step: 10,
      label: "box length",
    },
  });

  useEffect(() => {
    const mesh = surface.current;
    if (!mesh) return;
    mesh.updateWorldMatrix(true, false);

    const center = new THREE.Box3()
      .setFromObject(mesh)
      .getCenter(new THREE.Vector3());
    const halfWidth = boxWidth / 2;
    const halfLength = boxLength / 2;

    const min = vector3ToCoords(
      [center.x - halfWidth, 0, center.z - halfLength],
      COORDS,
    );
    const max = vector3ToCoords(
      [center.x + halfWidth, 0, center.z + halfLength],
      COORDS,
    );
    setPanBounds([
      [
        Math.min(min.longitude, max.longitude),
        Math.min(min.latitude, max.latitude),
      ],
      [
        Math.max(min.longitude, max.longitude),
        Math.max(min.latitude, max.latitude),
      ],
    ]);

    const coord = vector3ToCoords([center.x, 0, center.z], COORDS);
    map.setCenter([coord.longitude, coord.latitude]);

    setBoxArea({
      x: center.x,
      z: center.z,
      width: boxWidth,
      length: boxLength,
    });
  }, [map, rotation, boxWidth, boxLength, setPanBounds, setBoxArea, surface]);
}
