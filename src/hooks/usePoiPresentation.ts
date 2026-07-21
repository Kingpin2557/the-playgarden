import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { vector3ToCoords, type useMap } from "react-three-map/maplibre";

import { COORDS } from "../constants";
import { getGround } from "../lib/dayNight";

// The centre of an object's world-space bounding box. Exported for
// PointOfInterest's own focus-camera logic to reuse.
export function boundingBoxCenter(object: THREE.Object3D) {
  object.updateWorldMatrix(true, true);
  const center = new THREE.Vector3();
  new THREE.Box3().setFromObject(object).getCenter(center);
  return center;
}

const LABEL_MARGIN = 1;
const RAY_HEIGHT = 1000;
const HINT_ZOOM = 19; // global zoom used to frame the highlighted PoI
const HINT_TOP_PAD = 0.35; // top inset (fraction of height) so the PoI sits lower

// Reused every frame across every PoI, instead of allocating fresh THREE
// objects per instance.
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

// Everything about how a PoI's model presents itself, independent of what
// happens when you click it: where its floating label sits, easing the
// global camera onto it while it's the onboarding highlight, and keeping it
// snapped to the ground every frame.
export function usePoiPresentation({
  ref,
  map,
  isHinted,
  isActive,
}: UsePoiPresentationArgs) {
  // Where the label sits: centred over the model, just above its highest point.
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

  // While this PoI is the onboarding highlight, ease the global camera onto
  // it so it's fully in view before the visitor clicks it. Inset the top so
  // it stays horizontally centred but sits lower, clear of the onboarding card.
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
      // Clear the inset once the highlight ends so the rest of the app centres.
      paddedRef.current = false;
      map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 });
      map.triggerRepaint();
    }
  }, [ref, isHinted, isActive, map]);

  // Every frame, drop the model's parent group so the model's lowest point
  // rests exactly on the ground mesh below it.
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
