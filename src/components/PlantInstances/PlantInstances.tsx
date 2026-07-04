import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import PlantLayer from "../PlantLayer/PlantLayer";
import { setGround } from "../../lib/ground";
import { usePanBox } from "../../hooks/usePanBox";

export interface PlantConfig {
  url: string;
  nodeName: string;
  count: number;
  weight?: string; // weight-map to scatter on; defaults to nodeName
}

interface InstancesProps {
  models: PlantConfig[];
  density: Record<string, number>; // per-model multiplier, keyed by nodeName
}

// Density is a multiplier on each layer's base count; this is its ceiling and
// also sizes the instance buffer so the scatter can grow past the base.
export const MAX_DENSITY = 2;

function PlantInstances({ models, density }: InstancesProps) {
  const surface = useRef<THREE.Mesh>(null!);
  const { nodes } = useGLTF("/models/plane.glb");
  const plane = nodes.ground as THREE.Mesh;

  // rotation: spin the ground (plane + plants) around the vertical axis.
  // up: which model axis points up (1 = on) — the inline X/Y/Z reads like
  //   Blender's axis toggles; it's aligned to the ground normal so plants stand.
  // Shares the "Map" Leva folder with longitude/latitude (Leva merges by name).
  const { rotation, up } = useControls("Map", {
    rotation: { value: 0, min: 0, max: 360, step: 1 },
    up: { value: { x: 0, y: 1, z: 0 }, min: 0, max: 1, step: 1 },
  });
  // Force each axis to a clean 0 or 1, whatever gets typed in the vector.
  const upAxis = {
    x: Math.round(up.x),
    y: Math.round(up.y),
    z: Math.round(up.z),
  };

  // The pannable box lives in its own hook (also in the "Map" Leva folder).
  usePanBox(surface, rotation);

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
