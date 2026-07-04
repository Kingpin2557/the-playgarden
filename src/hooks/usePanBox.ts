import { useEffect, type RefObject } from "react";
import * as THREE from "three";
import { useMap, vector3ToCoords } from "react-three-map/maplibre";
import { useControls } from "leva";

import { COORDS } from "../coords";
import { useMapStore } from "../store/mapStore";

// Owns the pannable box: a boxWidth × boxLength rectangle (metres) centred on the
// plane. Publishes it to the map as maxBounds, keeps the plane centred in view,
// and shares the box so the weather can spawn over it. Lives in the "Map" Leva
// folder (Leva merges by name, so it joins rotation/longitude/latitude).
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

    // Two opposite corners are enough (the scene is aligned to north).
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

    // Keep the box centre in the middle of the viewport.
    const coord = vector3ToCoords([center.x, 0, center.z], COORDS);
    map.setCenter([coord.longitude, coord.latitude]);

    // Share the box (scene metres) so the weather can spawn over it.
    setBoxArea({
      x: center.x,
      z: center.z,
      width: boxWidth,
      length: boxLength,
    });
  }, [map, rotation, boxWidth, boxLength, setPanBounds, setBoxArea, surface]);
}
