import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { useGLTF } from "@react-three/drei";
import { useMap } from "react-three-map/maplibre";
import type { PlantConfig } from "../PlantInstances/PlantInstances";

const instanceTransform = new THREE.Object3D(); // reused to build each matrix

// One fixed seed so the scatter looks the same on every reload.
const SCATTER_SEED = 1337;

// Instances placed per frame. Big enough to fill in within a few frames (so
// there's no visible crawl), small enough to never freeze the page on load.
const CHUNK_SIZE = 50000;

// Tiny deterministic RNG: the same seed always yields the same sequence.
function makeRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
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
  density,
  capacity,
  up,
}: {
  config: PlantConfig;
  surface: RefObject<THREE.Mesh>;
  density: number;
  capacity: number;
  up: { x: number; y: number; z: number }; // model's up axis, aligned to normal
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

    const random = makeRandom(SCATTER_SEED);
    const activeCount = Math.min(Math.round(config.count * density), capacity);
    const upVector = new THREE.Vector3(up.x, up.y, up.z).normalize();

    const modelScale = new THREE.Vector3();
    model.updateWorldMatrix(true, false);
    model.getWorldScale(modelScale);

    const sampler = new MeshSurfaceSampler(surfaceMesh)
      .setWeightAttribute(`_${config.weight ?? config.nodeName}`)
      .build();

    const position = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const spin = new THREE.Quaternion();
    const align = new THREE.Quaternion();

    let placed = 0;
    let frameId = 0;

    // Place CHUNK_SIZE instances, then hand control back to the browser and
    // continue next frame, so the plants fill in without blocking the page.
    function placeChunk() {
      // MeshSurfaceSampler samples with Math.random(); swap in the seeded
      // generator only around the sampling, then restore it.
      const originalRandom = Math.random;
      Math.random = random;
      const end = Math.min(placed + CHUNK_SIZE, activeCount);
      for (; placed < end; placed++) {
        sampler.sample(position, normal);
        // spin around the up axis first, then tilt that up axis onto the
        // ground normal — so the random spin never tips the model over.
        spin.setFromAxisAngle(upVector, random() * Math.PI * 2);
        align.setFromUnitVectors(upVector, normal);
        instanceTransform.position.copy(position);
        instanceTransform.quaternion.copy(align).multiply(spin);
        instanceTransform.scale.copy(modelScale);
        instanceTransform.updateMatrix();
        instancedMesh.setMatrixAt(placed, instanceTransform.matrix);
      }
      Math.random = originalRandom;

      instancedMesh.count = placed;
      instancedMesh.instanceMatrix.needsUpdate = true;
      map.triggerRepaint();

      if (placed < activeCount) frameId = requestAnimationFrame(placeChunk);
    }
    placeChunk();

    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    model,
    surface,
    config.nodeName,
    config.weight,
    config.count,
    density,
    up.x,
    up.y,
    up.z,
  ]);

  if (!model) return null;

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[model.geometry, model.material, capacity]}
      frustumCulled={false}
    />
  );
}

export default PlantLayer;
