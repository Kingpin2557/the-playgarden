import Transform from "../components/Transform";
import { useState } from "react";
import * as THREE from "three";

import { OrbitControls, Sphere } from "@react-three/drei";

function Experience() {
  const [selected, setSelected] = useState<THREE.Object3D | null>(null);
  const isDev = false;

  const handleSelect = (e: any) => {
    setSelected(e.object);
  };

  return (
    <>
      <OrbitControls makeDefault />

      <Transform isDev={isDev} selected={selected}>
        <Sphere onClick={handleSelect} position={[-3, 0, 0]} />
        <Sphere onClick={handleSelect} position={[0, 0, 0]} />
        <Sphere onClick={handleSelect} position={[3, 0, 0]} />
      </Transform>
    </>
  );
}

export default Experience;
