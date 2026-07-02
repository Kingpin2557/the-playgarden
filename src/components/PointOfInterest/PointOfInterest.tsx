import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { vector3ToCoords } from "react-three-map/maplibre";

import "./PointOfInterest.css";
import { COORDS } from "../../coords";
import { usePoiStore } from "../../store/poiStore";

const FOCUS = { zoom: 22, pitch: 55, bearing: 30 };
const LABEL_MARGIN = 1;

interface PointOfInterestProps {
  name: string;
  position: [number, number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  children: ReactNode;
}

function PointOfInterest({
  name,
  position,
  zoom,
  pitch,
  bearing,
  children,
}: PointOfInterestProps) {
  const setFocus = usePoiStore((state) => state.setFocus);
  const clear = usePoiStore((state) => state.clear);
  const isActive = usePoiStore((state) => state.activeName === name);

  const contentRef = useRef<THREE.Group>(null!);
  const [labelPosition, setLabelPosition] = useState<[number, number, number]>([
    0, 2, 0,
  ]);

  useEffect(() => {
    contentRef.current.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(contentRef.current);
    if (box.isEmpty()) return;
    box.applyMatrix4(contentRef.current.matrixWorld.clone().invert());
    const center = new THREE.Vector3();
    box.getCenter(center);
    setLabelPosition([center.x, box.max.y + LABEL_MARGIN, center.z]);
  }, [position]);

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (isActive) {
      clear();
      return;
    }
    const coordinate = vector3ToCoords(
      [position[0] + labelPosition[0], 0, position[2] + labelPosition[2]],
      COORDS,
    );
    setFocus(name, {
      longitude: coordinate.longitude,
      latitude: coordinate.latitude,
      zoom: zoom ?? FOCUS.zoom,
      pitch: pitch ?? FOCUS.pitch,
      bearing: bearing ?? FOCUS.bearing,
    });
  };

  return (
    <group position={position}>
      <group ref={contentRef}>{children}</group>

      <Html position={labelPosition} center>
        <button
          onClick={handleClick}
          className={isActive ? "poi-label poi-label--active" : "poi-label"}
        >
          {isActive ? "← Back" : name}
        </button>
      </Html>
    </group>
  );
}

export default PointOfInterest;
