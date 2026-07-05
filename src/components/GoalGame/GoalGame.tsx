import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMap } from "react-three-map/maplibre";
import { Line, useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import {
  Physics,
  RigidBody,
  CuboidCollider,
  TrimeshCollider,
  type RapierRigidBody,
} from "@react-three/rapier";

import { useGameStore } from "../../store/gameStore";

// A simple black-and-white ball texture, drawn once on a canvas: white base with
// a handful of dark pentagons scattered on it.
function makeSoccerTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f4f4f4";
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = "#1c1c1c";
  for (let index = 0; index < 14; index++) {
    const centreX = Math.random() * 256;
    const centreY = Math.random() * 256;
    const radius = 12 + Math.random() * 12;
    const spin = Math.random() * Math.PI;
    ctx.beginPath();
    for (let corner = 0; corner < 5; corner++) {
      const angle = spin + (corner * 2 * Math.PI) / 5 - Math.PI / 2;
      const x = centreX + Math.cos(angle) * radius;
      const y = centreY + Math.sin(angle) * radius;
      if (corner === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

const soccerTexture = makeSoccerTexture();

type Aim = { from: [number, number, number]; to: [number, number, number] };
type Mesh = { verts: Float32Array; idx: Uint32Array };
type Split = {
  left: Mesh;
  right: Mesh;
  size: { width: number; depth: number; height: number; minY: number };
};

// Turn the model's triangles into two trimeshes, split down the middle so each
// goal (left/right end) becomes its own precise collider.
function splitGoals(scene: THREE.Object3D): Split | null {
  const clone = scene.clone(true);
  clone.updateMatrixWorld(true);
  let geometry: THREE.BufferGeometry | null = null;
  clone.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh && !geometry) {
      geometry = mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld);
    }
  });
  if (!geometry) return null;

  const position = (geometry as THREE.BufferGeometry).getAttribute("position");
  const index = (geometry as THREE.BufferGeometry).getIndex();
  const box = new THREE.Box3().setFromBufferAttribute(
    position as THREE.BufferAttribute,
  );
  const midX = (box.min.x + box.max.x) / 2;

  const left: number[] = [];
  const right: number[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const triangles = index ? index.count / 3 : position.count / 3;
  for (let t = 0; t < triangles; t++) {
    const i0 = index ? index.getX(t * 3) : t * 3;
    const i1 = index ? index.getX(t * 3 + 1) : t * 3 + 1;
    const i2 = index ? index.getX(t * 3 + 2) : t * 3 + 2;
    a.fromBufferAttribute(position, i0);
    b.fromBufferAttribute(position, i1);
    c.fromBufferAttribute(position, i2);
    const target = (a.x + b.x + c.x) / 3 < midX ? left : right;
    target.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  }

  const toMesh = (values: number[]): Mesh => {
    const verts = new Float32Array(values);
    const idx = new Uint32Array(verts.length / 3);
    for (let i = 0; i < idx.length; i++) idx[i] = i;
    return { verts, idx };
  };

  return {
    left: toMesh(left),
    right: toMesh(right),
    size: {
      width: box.max.x - box.min.x,
      depth: box.max.z - box.min.z,
      height: box.max.y - box.min.y,
      minY: box.min.y,
    },
  };
}

// Only the ball should trip a goal sensor — not the walls or the goal itself.
function ballEntered(payload: {
  other: { rigidBodyObject?: THREE.Object3D | null };
}) {
  return payload.other.rigidBodyObject?.userData?.ball === true;
}

// center is the goals' position in scene metres (world XZ); rotation matches the
// placed model. The pitch is built inside one rotated body, so the two goals sit
// along the model's long (local X) axis just like what you see.
function GoalGame({
  center,
  url,
  rotation,
}: {
  center: { x: number; z: number };
  url: string;
  rotation: number;
}) {
  const map = useMap();
  const { scene } = useGLTF(url);
  const scoreLeft = useGameStore((state) => state.scoreLeft);
  const scoreRight = useGameStore((state) => state.scoreRight);
  const resetGame = useGameStore((state) => state.resetGame);
  const resetToken = useGameStore((state) => state.resetToken);

  const ballRef = useRef<RapierRigidBody>(null!);
  const ballMeshRef = useRef<THREE.Mesh>(null!);
  const draggingRef = useRef(false);
  const [aim, setAim] = useState<Aim | null>(null);

  // Build the two goal colliders + measurements from the model, once.
  const [goals, setGoals] = useState<Split | null>(null);
  useEffect(() => {
    setGoals(splitGoals(scene));
  }, [scene]);

  // Fresh scoreboard each time you enter the game.
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const { ballRadius, kick, margin, ballStart, goalWidth, goalInset, goalShift, debug } =
    useControls("Ball Game", {
      ballRadius: { value: 0.4, min: 0.1, max: 1.5, step: 0.05 },
      kick: { value: 2.5, min: 0.5, max: 8, step: 0.5, label: "kick power" },
      margin: { value: 1.2, min: 1, max: 2, step: 0.05, label: "wall margin" },
      ballStart: { value: { x: 0, z: 0 }, step: 0.5, label: "ball start" },
      goalWidth: { value: 3, min: 1, max: 12, step: 0.5, label: "goal width" },
      goalInset: { value: 1.5, min: 0, max: 8, step: 0.1, label: "goal inset" },
      goalShift: { value: 0, min: -6, max: 6, step: 0.5, label: "goal shift" },
      debug: { value: false, label: "show colliders" },
    });

  const size = goals?.size ?? { width: 22, depth: 3.2, height: 1.5, minY: 0 };
  const halfX = (size.width * margin) / 2;
  const halfZ = (size.depth * margin) / 2;
  const wallHeight = size.height;
  const wallThickness = 0.3;
  const spawnY = ballRadius + 0.05;
  const restY = -size.minY;
  const goalX = size.width / 2 - goalInset;

  const cx = center.x;
  const cz = center.z;
  const spinY = (rotation * Math.PI) / 180;
  const cos = Math.cos(spinY);
  const sin = Math.sin(spinY);

  // Keep the ball start inside the walls, then rotate it into world XZ.
  const clamp = (value: number, limit: number) =>
    Math.max(-limit, Math.min(limit, value));
  const sx = clamp(ballStart.x, halfX - ballRadius - wallThickness);
  const sz = clamp(ballStart.z, halfZ - ballRadius - wallThickness);
  const startWX = cx + sx * cos + sz * sin;
  const startWZ = cz - sx * sin + sz * cos;
  const maxPull = Math.max(halfX, halfZ);

  // The map only renders on demand, so keep it ticking while we play.
  useFrame(() => map.triggerRepaint());

  // Put the ball back on its start spot whenever resetToken changes.
  useEffect(() => {
    const ball = ballRef.current;
    if (!ball) return;
    ball.setTranslation({ x: startWX, y: spawnY, z: startWZ }, true);
    ball.setLinvel({ x: 0, y: 0, z: 0 }, true);
    ball.setAngvel({ x: 0, y: 0, z: 0 }, true);
  }, [resetToken, startWX, startWZ, spawnY]);

  const ballWorld = () => {
    const point = new THREE.Vector3();
    ballMeshRef.current.getWorldPosition(point);
    return point;
  };

  // Click the ball, drag out to aim (direction + power), release to shoot.
  const startDrag = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    draggingRef.current = true;
    const from = ballWorld();
    setAim({ from: [from.x, spawnY, from.z], to: [from.x, spawnY, from.z] });
  };

  const moveDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!draggingRef.current) return;
    setAim((current) =>
      current
        ? { from: current.from, to: [event.point.x, spawnY, event.point.z] }
        : current,
    );
  };

  const endDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setAim(null);

    const from = ballWorld();
    const direction = new THREE.Vector3(
      event.point.x - from.x,
      0,
      event.point.z - from.z,
    );
    const distance = direction.length();
    if (distance < 0.05) return;
    const strength = Math.min(distance, maxPull) / maxPull;
    direction.normalize().multiplyScalar(strength * kick);
    ballRef.current.applyImpulse({ x: direction.x, y: 0, z: direction.z }, true);
  };

  return (
    <Physics gravity={[0, -9.81, 0]} debug={debug}>
      {/* Ground + four walls, built in the model's rotated frame. */}
      <RigidBody type="fixed" position={[cx, 0, cz]} rotation={[0, spinY, 0]}>
        <CuboidCollider args={[halfX, 0.5, halfZ]} position={[0, -0.5, 0]} friction={0.2} />
        <CuboidCollider args={[wallThickness, wallHeight, halfZ]} position={[halfX, wallHeight, 0]} restitution={0.5} />
        <CuboidCollider args={[wallThickness, wallHeight, halfZ]} position={[-halfX, wallHeight, 0]} restitution={0.5} />
        <CuboidCollider args={[halfX, wallHeight, wallThickness]} position={[0, wallHeight, halfZ]} restitution={0.5} />
        <CuboidCollider args={[halfX, wallHeight, wallThickness]} position={[0, wallHeight, -halfZ]} restitution={0.5} />
      </RigidBody>

      {/* Invisible pitch — only follows the drag while aiming. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[cx, 0.02, cz]}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
      >
        <planeGeometry args={[halfX * 3, halfX * 3]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Aim line while dragging. */}
      {aim && <Line points={[aim.from, aim.to]} color="#ffcc00" lineWidth={3} />}

      {/* Goal colliders — one precise trimesh per goal. */}
      {goals && (
        <RigidBody
          type="fixed"
          colliders={false}
          position={[cx, restY, cz]}
          rotation={[0, spinY, 0]}
        >
          <TrimeshCollider args={[goals.left.verts, goals.left.idx]} />
          <TrimeshCollider args={[goals.right.verts, goals.right.idx]} />
        </RigidBody>
      )}

      {/* Scoring zones — one just inside each goal mouth. */}
      <RigidBody
        type="fixed"
        sensor
        position={[cx, 0, cz]}
        rotation={[0, spinY, 0]}
        onIntersectionEnter={(payload) => ballEntered(payload) && scoreLeft()}
      >
        <CuboidCollider
          args={[0.8, wallHeight / 2, goalWidth / 2]}
          position={[-goalX, wallHeight / 2, goalShift]}
        />
      </RigidBody>
      <RigidBody
        type="fixed"
        sensor
        position={[cx, 0, cz]}
        rotation={[0, spinY, 0]}
        onIntersectionEnter={(payload) => ballEntered(payload) && scoreRight()}
      >
        <CuboidCollider
          args={[0.8, wallHeight / 2, goalWidth / 2]}
          position={[goalX, wallHeight / 2, goalShift]}
        />
      </RigidBody>

      {/* The ball. */}
      <RigidBody
        ref={ballRef}
        userData={{ ball: true }}
        colliders="ball"
        ccd
        position={[startWX, spawnY, startWZ]}
        restitution={0.5}
        friction={0.2}
        linearDamping={0.1}
        angularDamping={0.2}
      >
        <mesh
          ref={ballMeshRef}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
        >
          <sphereGeometry args={[ballRadius, 32, 32]} />
          <meshStandardMaterial map={soccerTexture} roughness={0.6} />
        </mesh>
      </RigidBody>
    </Physics>
  );
}

export default GoalGame;
