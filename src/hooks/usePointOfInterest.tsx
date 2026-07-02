import { useEffect, useRef, useState, type MouseEvent } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { vector3ToCoords } from "react-three-map/maplibre";

import "./poiLabel.css";
import { COORDS } from "../coords";
import { usePoiStore } from "../store/poiStore";
import { getGround } from "../lib/ground";

const LABEL_MARGIN = 1;
const RAY_HEIGHT = 1000;

const raycaster = new THREE.Raycaster();
const DOWN = new THREE.Vector3(0, -1, 0);
const rayOrigin = new THREE.Vector3();
const modelBox = new THREE.Box3();

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

  useFrame(() => {
    const model = ref.current;
    const ground = getGround();
    if (!model?.parent || !ground) return;

    const group = model.parent;
    group.updateWorldMatrix(true, false);
    group.getWorldPosition(rayOrigin);
    rayOrigin.y = RAY_HEIGHT;
    raycaster.set(rayOrigin, DOWN);

    const hits = raycaster.intersectObject(ground, false);
    if (hits.length === 0) return;

    model.updateWorldMatrix(true, true);
    modelBox.setFromObject(model);
    // lift/lower the group so the model's lowest point rests on the ground
    group.position.y -= modelBox.min.y - hits[0].point.y;
  });

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

  // Clicking the model must not bubble to the Canvas onPointerMissed,
  // so only the label can return to the global view.
  const onModelClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
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

  return { ref, label, onModelClick };
}
