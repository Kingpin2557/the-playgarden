import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { useGLTF } from "@react-three/drei";
import { useMap } from "react-three-map/maplibre";
import type { PlantConfig } from "../PlantInstances/PlantInstances";

// Models come in Blender Z-up (their up axis is +Z).
const UP = new THREE.Vector3(0, 0, -1);
const instanceTransform = new THREE.Object3D(); // reused to build each matrix

// Deterministic RNG (mulberry32) — same seed always gives the same numbers,
// so the scatter is identical on every reload instead of reshuffling.
function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Stable seed derived from the layer name, so each type (plants/rocks/trees)
// has its own fixed-but-distinct distribution.
function seedFromText(text: string) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function firstMesh(root: THREE.Object3D): THREE.Mesh | null {
  let found: THREE.Mesh | null = null;
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!found && mesh.isMesh) found = mesh;
  });
  return found;
}

function PlantLayer({
  config,
  surface,
  seed,
}: {
  config: PlantConfig;
  surface: RefObject<THREE.Mesh>;
  seed: number;
}) {
  const map = useMap();
  const { scene } = useGLTF(config.url);
  const model = firstMesh(scene);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);

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

  // Scatter deterministically: seed both the surface sampling AND the spin.
  useEffect(() => {
    const surfaceMesh = surface.current;
    const instancedMesh = instancedMeshRef.current;
    if (!surfaceMesh || !model || !instancedMesh) return;

    // combine the Leva seed with the layer name: distinct per type, and
    // changing the seed reshuffles everything together.
    const random = makeRandom((seedFromText(config.nodeName) ^ seed) >>> 0);

    const modelScale = new THREE.Vector3();
    model.updateWorldMatrix(true, false);
    model.getWorldScale(modelScale);

    // MeshSurfaceSampler samples with Math.random(); swap in our seeded generator
    // so the scatter is identical every reload, then restore it afterwards.
    const originalRandom = Math.random;
    Math.random = random;
    try {
      const sampler = new MeshSurfaceSampler(surfaceMesh)
        .setWeightAttribute(`_${config.nodeName}`)
        .build();

      const position = new THREE.Vector3();
      const normal = new THREE.Vector3();
      for (let index = 0; index < config.count; index++) {
        sampler.sample(position, normal);
        instanceTransform.position.copy(position);
        instanceTransform.quaternion.setFromUnitVectors(UP, normal);
        instanceTransform.rotateZ(random() * Math.PI * 2); // seeded spin
        instanceTransform.scale.copy(modelScale);
        instanceTransform.updateMatrix();
        instancedMesh.setMatrixAt(index, instanceTransform.matrix);
      }
    } finally {
      Math.random = originalRandom;
    }

    instancedMesh.count = config.count;
    instancedMesh.instanceMatrix.needsUpdate = true;
    map.triggerRepaint();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, surface, config.nodeName, config.count, , seed]);

  if (!model) return null;

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[model.geometry, model.material, config.count]}
      frustumCulled={false}
    />
  );
}

export default PlantLayer;
