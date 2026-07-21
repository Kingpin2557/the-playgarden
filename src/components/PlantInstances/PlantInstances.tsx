import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import PlantLayer from "../PlantLayer/PlantLayer";
import { setGround } from "../../lib/dayNight";
import { usePanBox } from "../../hooks/usePanBox";
import type { PlantConfig } from "../../types";

interface PlantInstancesProps {
  models: PlantConfig[];
  density: Record<string, number>;
}

export const MAX_DENSITY = 2;

function PlantInstances({ models, density }: PlantInstancesProps) {
  const surface = useRef<THREE.Mesh>(null!);
  const { nodes } = useGLTF("/models/plane.glb");
  const plane = nodes.ground as THREE.Mesh;

  const { rotation, up } = useControls("Map", {
    rotation: { value: 0, min: 0, max: 360, step: 1 },
    up: { value: { x: 0, y: 1, z: 0 }, min: 0, max: 1, step: 1 },
  });
  const upAxis = {
    x: Math.round(up.x),
    y: Math.round(up.y),
    z: Math.round(up.z),
  };

  usePanBox(surface, rotation);

  const geometryRef = useRef<THREE.BufferGeometry | undefined>(undefined);
  if (!geometryRef.current) {
    plane.updateWorldMatrix(true, false);
    const scale = new THREE.Vector3();
    plane.getWorldScale(scale);
    geometryRef.current = plane.geometry
      .clone()
      .applyMatrix4(new THREE.Matrix4().makeScale(scale.x, scale.y, scale.z));
  }

  useEffect(() => {
    setGround(surface.current);
    return () => setGround(null);
  }, []);

  return (
    <group rotation={[0, (rotation * Math.PI) / 180, 0]}>
      <mesh
        ref={surface}
        geometry={geometryRef.current}
        material={plane.material}
      />

      {models.map((config) => (
        <PlantLayer
          key={config.url + config.nodeName}
          config={config}
          surface={surface}
          density={density[config.nodeName] ?? 1}
          capacity={Math.ceil(config.count * MAX_DENSITY)}
          up={upAxis}
        />
      ))}
    </group>
  );
}

export default PlantInstances;
