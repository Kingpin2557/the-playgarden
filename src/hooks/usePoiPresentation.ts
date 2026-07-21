import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { vector3ToCoords, type useMap } from "react-three-map/maplibre";

import { COORDS } from "../constants";
import { getGround } from "../lib/dayNight";

export function boundingBoxCenter(object: THREE.Object3D) {
  object.updateWorldMatrix(true, true);
  const center = new THREE.Vector3();
  new THREE.Box3().setFromObject(object).getCenter(center);
  return center;
}

const LABEL_MARGIN = 1;
const RAY_HEIGHT = 1000;
const HINT_ZOOM = 19;
const HINT_TOP_PAD = 0.35;

const raycaster = new THREE.Raycaster();
const DOWN = new THREE.Vector3(0, -1, 0);
const rayOrigin = new THREE.Vector3();
const modelBox = new THREE.Box3();

interface UsePoiPresentationArgs {
  ref: RefObject<THREE.Object3D>;
  map: ReturnType<typeof useMap>;
  isHinted: boolean;
  isActive: boolean;
}

export function usePoiPresentation({
  ref,
  map,
  isHinted,
  isActive,
}: UsePoiPresentationArgs) {
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
  }, [ref]);

  const paddedRef = useRef(false);
  useEffect(() => {
    const object = ref.current;
    if (isHinted && !isActive && object) {
      const center = boundingBoxCenter(object);
      const coordinate = vector3ToCoords([center.x, 0, center.z], COORDS);
      const topPad = map.getContainer().clientHeight * HINT_TOP_PAD;
      map.easeTo({
        center: [coordinate.longitude, coordinate.latitude],
        zoom: HINT_ZOOM,
        padding: { top: topPad, bottom: 0, left: 0, right: 0 },
        duration: 800,
      });
      paddedRef.current = true;
    } else if (paddedRef.current) {
      paddedRef.current = false;
      map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 });
      map.triggerRepaint();
    }
  }, [ref, isHinted, isActive, map]);

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
    group.position.y -= modelBox.min.y - hits[0].point.y;
  });

  return labelPosition;
}
