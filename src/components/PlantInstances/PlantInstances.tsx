import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import PlantLayer from "../PlantLayer/PlantLayer";
import { setGround } from "../../lib/ground";

export interface PlantConfig {
  url: string;
  nodeName: string;
  count: number;
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

  // Spin the whole ground (plane + its scattered plants) around the vertical
  // axis. Rotating only on Y keeps it lying flat on the map, never tilted.
  // upX/upY/upZ toggle which axis is the model's up (Blender-style on/off); it
  // gets aligned to the ground normal so the scattered plants stand upright.
  // Shares the "Map" Leva folder with longitude/latitude (Leva merges by name).
  const { rotation, upX, upY, upZ } = useControls("Map", {
    rotation: { value: 0, min: 0, max: 360, step: 1 },
    upX: { value: false, label: "up X" },
    upY: { value: true, label: "up Y" },
    upZ: { value: false, label: "up Z" },
  });
  const up = { x: upX ? 1 : 0, y: upY ? 1 : 0, z: upZ ? 1 : 0 };

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
          up={up}
        />
      ))}
    </group>
  );
}

export default PlantInstances;
