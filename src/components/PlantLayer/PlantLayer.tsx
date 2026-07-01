import { useEffect, type RefObject } from "react";
import * as THREE from "three";
import { useGLTF, Sampler } from "@react-three/drei";
import { useMap } from "react-three-map/maplibre";
import type { PlantConfig } from "../PlantInstances/PlantInstances";

// Models come in Blender Z-up (their up axis is +Z).
const UP = new THREE.Vector3(0, 0, -1);

function firstMesh(root: THREE.Object3D): THREE.Mesh | null {
  let mesh: THREE.Mesh | null = null;
  root.traverse((object) => {
    const m = object as THREE.Mesh;
    if (!mesh && m.isMesh) mesh = m;
  });
  return mesh;
}

function PlantLayer({
  config,
  surface,
}: {
  config: PlantConfig;
  surface: RefObject<THREE.Mesh>;
}) {
  const map = useMap();
  const { scene } = useGLTF(config.url);
  const model = firstMesh(scene);

  useEffect(() => {
    if (!model) return;
    const material = model.material as THREE.MeshStandardMaterial;
    material.alphaTest = 0.5;
    material.transparent = false;
    material.depthWrite = true;
    material.needsUpdate = true;
    material.side = THREE.DoubleSide;
    map.triggerRepaint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  if (!model) return null;

  const modelScale = new THREE.Vector3();
  model.updateWorldMatrix(true, false);
  model.getWorldScale(modelScale);

  return (
    <Sampler
      mesh={surface}
      weight={`_${config.nodeName}`}
      count={config.count}
      transform={({ dummy, position, normal }) => {
        dummy.position.copy(position);
        dummy.quaternion.setFromUnitVectors(UP, normal);
        dummy.rotateZ(Math.random() * Math.PI * 2);
        dummy.scale.copy(modelScale);
        dummy.updateMatrix();
      }}
    >
      <instancedMesh
        args={[model.geometry, model.material, config.count]}
        frustumCulled={false}
      />
    </Sampler>
  );
}

export default PlantLayer;
