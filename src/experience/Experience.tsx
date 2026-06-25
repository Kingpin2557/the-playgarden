import Transform from "../components/Transform";
import { useEffect, useState } from "react";
import * as THREE from "three";

import { Sphere, Outlines } from "@react-three/drei";
import PlantInstances from "../components/PlantInstances";

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

  const MY_PLANTS = [
    { url: "/models/plant.glb", nodeName: "SM_Plant_02_LOD1", scale: 0.05 },
    { url: "/models/rock.glb", nodeName: "SM_Rock_01_LOD1", scale: 0.02 },
  ];

  return (
    <>
      <ambientLight intensity={Math.PI} />
      <directionalLight position={[10, 20, 10]} intensity={2} />
      <PlantInstances models={MY_PLANTS} />

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
