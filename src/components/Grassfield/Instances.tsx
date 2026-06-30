import { useEffect } from "react";
import * as THREE from "three";
import { Sampler, useGLTF } from "@react-three/drei";
import { useMap } from "react-three-map/maplibre";

const COUNT = 10000;
const SCALE = 0.05; // tweak until the trees look right
const UP = new THREE.Vector3(0, 0, 1); // the model's up axis

function Instances() {
  const map = useMap();
  const { nodes } = useGLTF("/models/plant.glb");
  const model = nodes.SM_Plant_02_LOD1 as THREE.Mesh;
  console.log(nodes);
  const material = model.material as THREE.MeshStandardMaterial;

  // Use alpha cut-out instead of blending: crisp leaf edges AND correct depth.
  // Done once (needsUpdate recompiles the shader, so don't run it every frame).
  useEffect(() => {
    material.alphaTest = 0.5;
    material.transparent = false;
    material.depthWrite = true;
    material.needsUpdate = true;
    map.triggerRepaint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <Sampler
        count={COUNT}
        transform={({ dummy, position, normal }) => {
          dummy.position.copy(position);
          dummy.quaternion.setFromUnitVectors(UP, normal);
          dummy.rotateX(Math.PI);
          dummy.rotateZ(Math.random() * Math.PI * 2);
          dummy.scale.setScalar(SCALE);
          dummy.updateMatrix();
        }}
      >
        <mesh>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="lightgreen" />
        </mesh>

        <instancedMesh
          args={[model.geometry, model.material, COUNT]}
          frustumCulled={false}
        />
      </Sampler>
    </group>
  );
}

export default Instances;
