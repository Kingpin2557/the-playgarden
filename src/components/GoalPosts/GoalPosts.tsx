import { RigidBody, CuboidCollider, type CollisionEnterPayload } from "@react-three/rapier";

import type { Split } from "../../lib/goalPhysics";

interface GoalPostsProps {
  goals: Split;
  goalKey: string; // remounts the colliders when the tuning offset/rotate changes
  position: [number, number, number];
  rotationY: number;
  showDebug: boolean;
  onLeftCollision: (payload: CollisionEnterPayload) => void;
  onRightCollision: (payload: CollisionEnterPayload) => void;
}

// The two goal colliders — one solid box per goal. Each reports the ball
// hitting it (onCollisionEnter), so the box itself is the goal detection —
// no separate sensor needed. showDebug renders the collider boxes so you can
// see exactly what the ball is hitting.
function GoalPosts({
  goals,
  goalKey,
  position,
  rotationY,
  showDebug,
  onLeftCollision,
  onRightCollision,
}: GoalPostsProps) {
  return (
    <>
      <RigidBody
        key={"L" + goalKey}
        type="fixed"
        colliders={false}
        position={position}
        rotation={[0, rotationY, 0]}
        onCollisionEnter={onLeftCollision}
      >
        <CuboidCollider args={goals.left.halfExtents} position={goals.left.center} />
      </RigidBody>
      <RigidBody
        key={"R" + goalKey}
        type="fixed"
        colliders={false}
        position={position}
        rotation={[0, rotationY, 0]}
        onCollisionEnter={onRightCollision}
      >
        <CuboidCollider args={goals.right.halfExtents} position={goals.right.center} />
      </RigidBody>

      {showDebug && (
        <group position={position} rotation={[0, rotationY, 0]}>
          <mesh position={goals.left.center}>
            <boxGeometry
              args={[
                goals.left.halfExtents[0] * 2,
                goals.left.halfExtents[1] * 2,
                goals.left.halfExtents[2] * 2,
              ]}
            />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.4} depthWrite={false} />
          </mesh>
          <mesh position={goals.right.center}>
            <boxGeometry
              args={[
                goals.right.halfExtents[0] * 2,
                goals.right.halfExtents[1] * 2,
                goals.right.halfExtents[2] * 2,
              ]}
            />
            <meshBasicMaterial color="#ff7a1a" transparent opacity={0.4} depthWrite={false} />
          </mesh>
        </group>
      )}
    </>
  );
}

export default GoalPosts;
