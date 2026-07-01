import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";

function Goals() {
  const { scene } = useGLTF("/models/goals.glb");

  const { initPosition, initRotation } = {
    initPosition: {
      long: -3.9991455078125,
      lat: -32.99993896484375,
    },
    initRotation: 38,
  };

  const { position, rotation } = useControls("Goal", {
    position: {
      value: { x: initPosition.long, y: initPosition.lat },
      step: 3,
      joystick: "invertY",
    },
    rotation: { value: initRotation, min: 0, max: 360, step: 1 },
  });

  return (
    <primitive
      object={scene}
      position={[position.x, 0, position.y]}
      rotation={[0, (rotation * Math.PI) / 180, 0]}
    />
  );
}

export default Goals;
