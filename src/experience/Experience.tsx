import Transform from "../components/Transform";
import { useEffect, useState } from "react";
import * as THREE from "three";

import { Sphere, Outlines } from "@react-three/drei";
import Instances from "../components/Instances";

function Experience({ isDev }: { isDev: boolean }) {
  const [selected, setSelected] = useState<THREE.Object3D | null>(null);

  const handleSelect = (e: any) => {
    if (isDev) return;
    e.stopPropagation();
    setSelected(e.object);
  };

  // Press Escape to deselect.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <ambientLight intensity={Math.PI} />
      <directionalLight position={[10, 20, 10]} intensity={2} />
      <Instances />

      <Transform selected={selected}>
        <Sphere name="sphere-left" onPointerDown={handleSelect}>
          <meshStandardMaterial color="orange" />
          {!isDev && selected?.name === "sphere-left" && (
            <Outlines thickness={0.05} color="red" screenspace />
          )}
        </Sphere>
        <Sphere name="sphere-center" onPointerDown={handleSelect}>
          <meshStandardMaterial color="tomato" />
          {!isDev && selected?.name === "sphere-center" && (
            <Outlines thickness={0.05} color="red" screenspace />
          )}
        </Sphere>
        <Sphere name="sphere-right" onPointerDown={handleSelect}>
          <meshStandardMaterial color="royalblue" />
          {!isDev && selected?.name === "sphere-right" && (
            <Outlines thickness={0.05} color="red" screenspace />
          )}
        </Sphere>
      </Transform>
    </>
  );
}

export default Experience;
