import { useEffect, useRef, useState, type MouseEvent } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { vector3ToCoords } from "react-three-map/maplibre";

import "./poiLabel.css";
import { COORDS } from "../coords";
import { usePoiStore } from "../store/poiStore";

const LABEL_MARGIN = 1;

function boundingBoxCenter(object: THREE.Object3D) {
  object.updateWorldMatrix(true, true);
  const center = new THREE.Vector3();
  new THREE.Box3().setFromObject(object).getCenter(center);
  return center;
}

export function usePointOfInterest(name: string) {
  const ref = useRef<THREE.Object3D>(null!);
  const setFocus = usePoiStore((state) => state.setFocus);
  const clear = usePoiStore((state) => state.clear);
  const isActive = usePoiStore((state) => state.activeName === name);

  const [labelPosition, setLabelPosition] = useState<[number, number, number]>([
    0, 2, 0,
  ]);

  useEffect(() => {
    const object = ref.current;
    if (!object) return;
    object.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) return;
    if (object.parent)
      box.applyMatrix4(object.parent.matrixWorld.clone().invert());
    const center = new THREE.Vector3();
    box.getCenter(center);
    setLabelPosition([center.x, box.max.y + LABEL_MARGIN, center.z]);
  }, []);

  const toggle = (event: MouseEvent) => {
    event.stopPropagation();
    if (isActive) {
      clear();
      return;
    }
    const center = boundingBoxCenter(ref.current);
    const coordinate = vector3ToCoords([center.x, 0, center.z], COORDS);
    setFocus(name, {
      longitude: coordinate.longitude,
      latitude: coordinate.latitude,
    });
  };

  const label = (
    <Html position={labelPosition} center>
      <button
        onClick={toggle}
        className={isActive ? "poi-label poi-label--active" : "poi-label"}
      >
        {isActive ? "← Back" : name}
      </button>
    </Html>
  );

  return { ref, label };
}
