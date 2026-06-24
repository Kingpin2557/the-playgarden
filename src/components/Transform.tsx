import { useEffect, type ReactNode } from "react";
import type { Object3D } from "three";
import { TransformControls } from "@react-three/drei";
import { useMap } from "react-three-map/maplibre";
import { useTransformMode } from "../hooks/useTransformMode";
import { useLeva } from "../hooks/useLeva";

interface TransformProps {
  isDev: boolean;
  selected: Object3D | null;
  children: ReactNode;
}

function Transform({ isDev, selected, children }: TransformProps) {
  const { mode } = useTransformMode("translate");
  const map = useMap();

  useLeva(selected);

  useEffect(() => {
    if (selected) map.dragPan.disable();
    else map.dragPan.enable();
  }, [selected, map]);

  return (
    <>
      {children}

      {selected && !isDev && (
        <TransformControls object={selected} mode={mode} />
      )}
    </>
  );
}

export default Transform;
