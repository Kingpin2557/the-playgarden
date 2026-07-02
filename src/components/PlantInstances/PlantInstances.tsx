import { useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import PlantLayer from "../PlantLayer/PlantLayer";

export interface PlantConfig {
  url: string;
  nodeName: string;
  count: number;
  occludes?: boolean;
}

interface InstancesProps {
  models: PlantConfig[];
}

function PlantInstances({ models }: InstancesProps) {
  const surface = useRef<THREE.Mesh>(null!);
  const { nodes } = useGLTF("/models/plane.glb");
  const plane = nodes.ground as THREE.Mesh;

  // Fixed scatter seed — same layout every reload. Change it to reshuffle.
  const { seed } = useControls("Scatter", {
    seed: { value: 4175, min: 0, max: 9999, step: 1 },
  });

  // Bake the plane's own exported scale into its geometry (like the models use
  // their node scale). Baking into geometry — not the mesh scale — keeps the
  // sampler aligned, since MeshSurfaceSampler reads geometry in local space.
  const geometryRef = useRef<THREE.BufferGeometry | undefined>(undefined);
  if (!geometryRef.current) {
    plane.updateWorldMatrix(true, false);
    const scale = new THREE.Vector3();
    plane.getWorldScale(scale);
    geometryRef.current = plane.geometry
      .clone()
      .applyMatrix4(new THREE.Matrix4().makeScale(scale.x, scale.y, scale.z));
  }

  return (
    <group>
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
          seed={seed}
        />
      ))}
    </group>
  );
}

export default PlantInstances;
