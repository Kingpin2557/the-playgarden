import { useEffect, useRef, useState, type MouseEvent } from "react";
import * as THREE from "three";
import { Html, useGLTF } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMap, vector3ToCoords } from "react-three-map/maplibre";
import { useControls } from "leva";

import "./PointOfInterest.css";
import { COORDS } from "../../coords";
import { usePoiStore } from "../../store/poiStore";
import { useAppStore } from "../../store/appStore";
import { getGround } from "../../lib/ground";

const LABEL_MARGIN = 1;
const RAY_HEIGHT = 1000;
const HINT_ZOOM = 19; // global zoom used to frame the highlighted PoI
const HINT_TOP_PAD = 0.35; // top inset (fraction of height) so the PoI sits lower

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

interface PointOfInterestProps {
  name: string; // shown on the sign and used as the store key
  url: string; // model to load
  folder: string; // Leva folder for its position/rotation
  position: { x: number; y: number };
  rotation: number;
  view: { zoom: number; pitch: number; bearing: number }; // focus viewpoint
  game?: boolean; // handled in Experience: spawns the ball game while focused
}

function PointOfInterest({
  name,
  url,
  folder,
  position,
  rotation,
  view,
}: PointOfInterestProps) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Object3D>(null!);
  const map = useMap();
  const setFocus = usePoiStore((state) => state.setFocus);
  const clear = usePoiStore((state) => state.clear);
  const isActive = usePoiStore((state) => state.activeName === name);
  const isHinted = useAppStore((state) => state.hintPoi === name);

  // position/rotation place the model; zoom/pitch/bearing are the focus shot —
  // tune bearing to angle the camera past any tree in the way.
  const {
    position: placement,
    rotation: spin,
    zoom,
    pitch,
    bearing,
  } = useControls(folder, {
    position: { value: position, step: 1, joystick: "invertY" },
    rotation: { value: rotation, min: 0, max: 360, step: 1 },
    zoom: { value: view.zoom, min: 0, max: 25, step: 0.5 },
    pitch: { value: view.pitch, min: 0, max: 80, step: 1 },
    bearing: { value: view.bearing, min: 0, max: 360, step: 1 },
  });

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

  // While this PoI is the onboarding highlight, ease the global camera onto it
  // so it's fully in view before the visitor clicks it. Inset the top so it
  // stays horizontally centred but sits lower, clear of the onboarding card.
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
  }, [isHinted, isActive, map]);

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

  const focusHere = () => {
    const center = boundingBoxCenter(ref.current);
    const coordinate = vector3ToCoords([center.x, 0, center.z], COORDS);
    setFocus(name, {
      longitude: coordinate.longitude,
      latitude: coordinate.latitude,
      zoom,
      pitch,
      bearing,
    });
  };

  const toggle = (event: MouseEvent) => {
    event.stopPropagation();
    if (isActive) {
      clear();
      return;
    }
    focusHere();
  };

  // Re-fly while this PoI is focused and its viewpoint sliders change, so you
  // can tune zoom/pitch/bearing live and see the shot update.
  useEffect(() => {
    if (isActive) focusHere();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, pitch, bearing]);

  // Clicking the model must not bubble to the Canvas onPointerMissed,
  // so only the label can return to the global view.
  const onModelClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
  };

  const labelClass = isActive
    ? "poi-label poi-label--active"
    : isHinted
      ? "poi-label poi-label--hint"
      : "poi-label";

  return (
    <group position={[placement.x, 0, placement.y]}>
      <primitive
        object={scene}
        ref={ref}
        onClick={onModelClick}
        rotation={[0, (spin * Math.PI) / 180, 0]}
      />
      <Html position={labelPosition} center>
        <button onClick={toggle} className={labelClass}>
          {isActive ? "← Back" : name}
        </button>
      </Html>
    </group>
  );
}

export default PointOfInterest;
