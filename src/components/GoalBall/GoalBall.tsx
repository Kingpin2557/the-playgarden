import type { RefObject } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";

import { soccerTexture } from "../../lib/goalPhysics";
import type { Aim } from "../../hooks/useAimAndShoot";

interface GoalBallProps {
  ballRef: RefObject<RapierRigidBody>;
  ballMeshRef: RefObject<THREE.Mesh>;
  radius: number;
  position: [number, number, number];
  aim: Aim | null;
  onBallDown: (event: ThreeEvent<PointerEvent>) => void;
  onDrag: (event: ThreeEvent<PointerEvent>) => void;
  onDragEnd: (event: ThreeEvent<PointerEvent>) => void;
  setCursor: (value: string) => void;
}

function GoalBall({
  ballRef,
  ballMeshRef,
  radius,
  position,
  aim,
  onBallDown,
  onDrag,
  onDragEnd,
  setCursor,
}: GoalBallProps) {
  return (
    <>
      {aim && <Line points={[aim.from, aim.to]} color="#ffcc00" lineWidth={3} />}

      <RigidBody
        ref={ballRef}
        userData={{ ball: true }}
        colliders="ball"
        ccd
        position={position}
        restitution={0.5}
        friction={0.2}
        linearDamping={0.1}
        angularDamping={0.2}
      >
        <mesh
          ref={ballMeshRef}
          onPointerDown={onBallDown}
          onPointerMove={onDrag}
          onPointerUp={onDragEnd}
          onPointerOver={() => setCursor("pointer")}
          onPointerOut={() => setCursor("")}
        >
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial map={soccerTexture} roughness={0.6} />
        </mesh>
      </RigidBody>
    </>
  );
}

export default GoalBall;
