import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";

import { usePointOfInterest } from "../../hooks/usePointOfInterest";

function Goals() {
  const { scene } = useGLTF("/models/goals.glb");
  const { ref, label, onModelClick } = usePointOfInterest("Goals");

  const { position, rotation } = useControls("Goal", {
    position: {
      value: { x: -25.9991455078125, y: -42.99993896484375 },
      step: 1,
      joystick: "invertY",
    },
    rotation: { value: 144, min: 0, max: 360, step: 1 },
  });

  return (
    <group position={[position.x, 0, position.y]}>
      <primitive
        object={scene}
        ref={ref}
        onClick={onModelClick}
        rotation={[0, (rotation * Math.PI) / 180, 0]}
      />
      {label}
    </group>
  );
}

export default Goals;
