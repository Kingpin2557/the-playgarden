import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls, button } from "leva";
import type { Object3D } from "three";

type Vec3 = [number, number, number];

export function useLeva(selected: Object3D | null) {
  const [values, set] = useControls("Transform", () => ({
    position: { value: [0, 0, 2.761183307347496], step: 0.01 },
    rotation: { value: [1.5000000000000007, 0, 0], step: 0.01 },
    scale: { value: [4.030814777822578, 1.27, 1], step: 0.01 },

    "📋 Copy Defaults": button(() => {
      if (!selected) return;

      const pos = selected.position.toArray();
      const rot = selected.rotation.toArray();
      const scl = selected.scale.toArray();

      const output = `
          position: { value: [${pos[0]}, ${pos[1]}, ${pos[2]}], step: 0.01 },
          rotation: { value: [${rot[0]}, ${rot[1]}, ${rot[2]}], step: 0.01 },
          scale: { value: [${scl[0]}, ${scl[1]}, ${scl[2]}], step: 0.01 },
      `.trim();

      console.log("🔥 COPY INTO useControls:\n\n" + output);
    }),
  }));

  // Object → Leva (gizmo updates UI)
  useFrame(() => {
    if (!selected) return;

    set({
      position: [
        selected.position.x,
        selected.position.y,
        selected.position.z,
      ] as Vec3,

      rotation: [
        selected.rotation.x,
        selected.rotation.y,
        selected.rotation.z,
      ] as Vec3,

      scale: [selected.scale.x, selected.scale.y, selected.scale.z] as Vec3,
    });
  });

  // Leva → Object (manual edits)
  useEffect(() => {
    if (!selected) return;

    selected.position.set(...values.position);
    selected.rotation.set(...values.rotation);
    selected.scale.set(...values.scale);
  }, [values, selected]);
}
