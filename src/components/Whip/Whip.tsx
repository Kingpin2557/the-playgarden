import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";

import { usePointOfInterest } from "../../hooks/usePointOfInterest";

function Whip() {
  const { scene } = useGLTF("/models/whip.glb");
  const { ref, label } = usePointOfInterest("Whip");

  const { position, rotation } = useControls("Whip", {
    position: {
      value: { x: -35.9991455078125, y: -85.99993896484375 },
      step: 1,
      joystick: "invertY",
    },
    rotation: { value: 38, min: 0, max: 360, step: 1 },
  });

  return (
    <group position={[position.x, 0, position.y]}>
      <primitive
        object={scene}
        ref={ref}
        rotation={[0, (rotation * Math.PI) / 180, 0]}
      />
      {label}
    </group>
  );
}

export default Whip;
