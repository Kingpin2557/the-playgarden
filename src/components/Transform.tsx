import type { ReactNode } from "react";
import type { Object3D } from "three";
import { useLeva } from "../hooks/useLeva";

interface TransformProps {
  selected: Object3D | null;
  children: ReactNode;
}

function Transform({ selected, children }: TransformProps) {
  useLeva(selected);

  return <>{children}</>;
}

export default Transform;
