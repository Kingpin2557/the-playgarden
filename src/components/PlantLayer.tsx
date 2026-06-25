import { useEffect } from "react";
import * as THREE from "three";
import { useGLTF, Sampler } from "@react-three/drei";
import type { PlantConfig } from "./PlantInstances";

function PlantLayer({ config }: { config: PlantConfig }) {
  const { nodes } = useGLTF(config.url);
  const model = nodes[config.nodeName] as THREE.Mesh;

  useEffect(() => {
    const material = model.material as THREE.MeshStandardMaterial;
    material.alphaTest = 0.5;
    material.transparent = false;
    material.depthWrite = true;
    material.needsUpdate = true;
  }, [model]);

  return (
    <Sampler
      count={config.count} // You can eventually make this part of the config
      transform={({ dummy, position, normal }) => {
        dummy.position.copy(position);
        dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        dummy.rotateX(Math.PI);
        dummy.rotateZ(Math.random() * Math.PI * 2);
        dummy.scale.setScalar(config.scale);
        dummy.updateMatrix();
      }}
    >
      <mesh>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="lightgreen" vertexColors={true} />
      </mesh>
      <instancedMesh
        args={[model.geometry, model.material, config.count]}
        frustumCulled={false}
      />
    </Sampler>
  );
}

export default PlantLayer;
