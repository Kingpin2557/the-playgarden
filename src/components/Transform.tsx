import { type ReactNode } from "react";
import type { Object3D } from "three";
import { TransformControls } from "@react-three/drei";
import { useTransformMode } from "../hooks/useTransformMode";
import { useLeva } from "../hooks/useLeva";

interface TransformProps {
  isDev: boolean;
  selected: Object3D | null;
  children: ReactNode;
}

function Transform({ isDev, selected, children }: TransformProps) {
  const { mode } = useTransformMode("translate");

  useLeva(selected);

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
