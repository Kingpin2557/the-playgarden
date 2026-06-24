import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls, button } from "leva";
import type { Object3D } from "three";

type Vec3 = [number, number, number];

interface Transform {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
}

function getTransform(object: Object3D): Transform {
  return {
    position: [object.position.x, object.position.y, object.position.z],
    rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
    scale: [object.scale.x, object.scale.y, object.scale.z],
  };
}

function applyTransform(object: Object3D, transform: Transform) {
  object.position.set(...transform.position);
  object.rotation.set(...transform.rotation);
  object.scale.set(...transform.scale);
}

export function useLeva(selected: Object3D | null) {
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    fetch("/objectTransforms.json")
      .then((response) => response.json())
      .then((data: Record<string, Transform>) => {
        for (const [name, transform] of Object.entries(data)) {
          const object = scene.getObjectByName(name);
          if (object) applyTransform(object, transform);
        }
      });
  }, [scene]);

  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const [values, set] = useControls("Transform", () => ({
    position: { value: [0, 0, 0], step: 0.01 },
    rotation: { value: [0, 0, 0], step: 0.01 },
    scale: { value: [1, 1, 1], step: 0.01 },

    "Copy Transform": button(() => {
      const object = selectedRef.current;
      if (object) {
        console.log(
          JSON.stringify({ [object.name]: getTransform(object) }, null, 2),
        );
      }
    }),
  }));

  useFrame(() => {
    if (selected) set(getTransform(selected));
  });

  useEffect(() => {
    const object = selectedRef.current;
    if (object) applyTransform(object, values as Transform);
  }, [values]);
}
