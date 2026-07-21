import type { ThreeEvent } from "@react-three/fiber";
import { RigidBody, CuboidCollider } from "@react-three/rapier";

interface GoalPitchProps {
  boxWX: number;
  boxWZ: number;
  spinY: number;
  halfX: number;
  halfZ: number;
  wallHeight: number;
  wallThickness: number;
  showCenter: boolean;
  onDrag: (event: ThreeEvent<PointerEvent>) => void;
  onDragEnd: (event: ThreeEvent<PointerEvent>) => void;
}

// The playing field: ground + four walls (one rotated rigid body), an
// optional magenta centre marker for tuning, and an invisible plane that
// extends the drag hit-area beyond the ball itself while aiming.
function GoalPitch({
  boxWX,
  boxWZ,
  spinY,
  halfX,
  halfZ,
  wallHeight,
  wallThickness,
  showCenter,
  onDrag,
  onDragEnd,
}: GoalPitchProps) {
  return (
    <>
      <RigidBody type="fixed" position={[boxWX, 0, boxWZ]} rotation={[0, spinY, 0]}>
        <CuboidCollider args={[halfX, 0.5, halfZ]} position={[0, -0.5, 0]} friction={0.2} />
        <CuboidCollider args={[wallThickness, wallHeight, halfZ]} position={[halfX, wallHeight, 0]} restitution={0.5} />
        <CuboidCollider args={[wallThickness, wallHeight, halfZ]} position={[-halfX, wallHeight, 0]} restitution={0.5} />
        <CuboidCollider args={[halfX, wallHeight, wallThickness]} position={[0, wallHeight, halfZ]} restitution={0.5} />
        <CuboidCollider args={[halfX, wallHeight, wallThickness]} position={[0, wallHeight, -halfZ]} restitution={0.5} />
      </RigidBody>

      {showCenter && (
        <group position={[boxWX, 0, boxWZ]}>
          <mesh position={[0, wallHeight, 0]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshBasicMaterial color="#ff2fd0" />
          </mesh>
          <mesh position={[0, wallHeight / 2, 0]}>
            <cylinderGeometry args={[0.06, 0.06, wallHeight * 2, 8]} />
            <meshBasicMaterial color="#ff2fd0" />
          </mesh>
        </group>
      )}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[boxWX, 0.02, boxWZ]}
        onPointerMove={onDrag}
        onPointerUp={onDragEnd}
      >
        <planeGeometry args={[halfX * 3, halfX * 3]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

export default GoalPitch;
