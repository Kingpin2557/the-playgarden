import { useEffect } from "react";
import * as THREE from "three";
import { Sampler, useGLTF } from "@react-three/drei";
import { useMap } from "react-three-map/maplibre";

const TREE_SCALE = 1; // tweak until the trees look right
const UP = new THREE.Vector3(0, 1, 0); // the model's up axis

function Instances() {
  const map = useMap();
  const { nodes } = useGLTF("/models/tree.glb");
  const tree = nodes.SM_Trunk01001 as THREE.Mesh;
  const material = tree.material as THREE.MeshStandardMaterial;

  // Use alpha cut-out instead of blending: crisp leaf edges AND correct depth.
  // Done once (needsUpdate recompiles the shader, so don't run it every frame).
  useEffect(() => {
    material.alphaTest = 0.5; // raise to trim more edge, lower to keep more
    material.transparent = false;
    material.depthWrite = true;
    material.needsUpdate = true;
    map.triggerRepaint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <Sampler
        count={1000}
        transform={({ dummy, position, normal }) => {
          dummy.position.copy(position);
          dummy.quaternion.setFromUnitVectors(UP, normal);
          dummy.rotateY(Math.random() * Math.PI * 2);
          dummy.scale.setScalar(TREE_SCALE);
          dummy.updateMatrix();
        }}
      >
        <mesh>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="lightgreen" />
        </mesh>

        <instancedMesh
          args={[tree.geometry, tree.material, 1000]}
          frustumCulled={false}
        />
      </Sampler>
    </group>
  );
}

export default Instances;
