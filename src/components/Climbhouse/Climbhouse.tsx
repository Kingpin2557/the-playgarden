import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";

import { usePointOfInterest } from "../../hooks/usePointOfInterest";

function Climbhouse() {
  const { scene } = useGLTF("/models/climbhouse.glb");
  const { ref, label, onModelClick } = usePointOfInterest("Climbhouse");

  const { position, rotation } = useControls("Climbhouse", {
    position: {
      value: { x: -43.9991455078125, y: -141.99993896484375 },
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
        onClick={onModelClick}
        rotation={[0, (rotation * Math.PI) / 180, 0]}
      />
      {label}
    </group>
  );
}

export default Climbhouse;
