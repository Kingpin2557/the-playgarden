import Transform from "../components/Transform";
import { useEffect, useState } from "react";
import * as THREE from "three";

import { Sphere } from "@react-three/drei";

function Experience() {
  const [selected, setSelected] = useState<THREE.Object3D | null>(null);

  const handleSelect = (e: any) => {
    setSelected(e.object);
  };

  // Press Escape to deselect (re-enables map panning).
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

      <Transform isDev={false} selected={selected}>
        <Sphere name="sphere-left" onClick={handleSelect}>
          <meshStandardMaterial color="orange" />
        </Sphere>
        <Sphere name="sphere-center" onClick={handleSelect}>
          <meshStandardMaterial color="tomato" />
        </Sphere>
        <Sphere name="sphere-right" onClick={handleSelect}>
          <meshStandardMaterial color="royalblue" />
        </Sphere>
      </Transform>
    </>
  );
}

export default Experience;
