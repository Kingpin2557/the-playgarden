import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useMap, vector3ToCoords } from "react-three-map/maplibre";

import { COORDS } from "../coords";

export function useFocusPlaneCenter() {
  const map = useMap();
  const { nodes } = useGLTF("/models/plane.glb");
  const hasFocused = useRef(false);

  useEffect(() => {
    if (hasFocused.current) return;
    const plane = nodes.ground as THREE.Mesh | undefined;
    if (!plane) return;

    plane.updateWorldMatrix(true, false);
    const worldScale = new THREE.Vector3();
    plane.getWorldScale(worldScale);

    if (!plane.geometry.boundingBox) plane.geometry.computeBoundingBox();
    const boxCenter = new THREE.Vector3();
    plane.geometry.boundingBox!.getCenter(boxCenter);

    const target = vector3ToCoords(
      [boxCenter.x * worldScale.x, 0, boxCenter.z * worldScale.z],
      COORDS,
    );
    map.setCenter([target.longitude, target.latitude]);
    hasFocused.current = true;
  }, [map, nodes]);
}
