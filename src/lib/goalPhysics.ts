import * as THREE from "three";

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

export const soccerTexture = makeSoccerTexture();

export interface GoalBox {
  center: [number, number, number];
  halfExtents: [number, number, number];
}

export type Split = {
  left: GoalBox;
  right: GoalBox;
  size: { width: number; depth: number; height: number; minY: number };
};

export function splitGoals(scene: THREE.Object3D): Split | null {
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

  const position = (geometry as THREE.BufferGeometry).getAttribute(
    "position",
  ) as THREE.BufferAttribute;
  const box = new THREE.Box3().setFromBufferAttribute(position);
  const midX = (box.min.x + box.max.x) / 2;

  const leftBox = new THREE.Box3();
  const rightBox = new THREE.Box3();
  const point = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    point.fromBufferAttribute(position, i);
    (point.x < midX ? leftBox : rightBox).expandByPoint(point);
  }

  const toGoalBox = (goalBox: THREE.Box3): GoalBox => {
    const center = goalBox.getCenter(new THREE.Vector3());
    const size = goalBox.getSize(new THREE.Vector3());
    return {
      center: [center.x, center.y, center.z],
      halfExtents: [size.x / 2, size.y / 2, size.z / 2],
    };
  };

  return {
    left: toGoalBox(leftBox),
    right: toGoalBox(rightBox),
    size: {
      width: box.max.x - box.min.x,
      depth: box.max.z - box.min.z,
      height: box.max.y - box.min.y,
      minY: box.min.y,
    },
  };
}

export function ballEntered(payload: {
  other: { rigidBodyObject?: THREE.Object3D | null };
}) {
  return payload.other.rigidBodyObject?.userData?.ball === true;
}

export interface GoalLayoutInputs {
  center: { x: number; z: number };
  rotation: number;
  goalPlacement: { x: number; z: number; rotation: number } | null;
  goals: Split | null;
  ballRadius: number;
  margin: number;
  boxCenter: { x: number; z: number };
  ballStart: { x: number; z: number };
  goalsOffset: { x: number; z: number };
  goalsRotate: number;
}

export interface GoalLayout {
  pitch: {
    boxWX: number;
    boxWZ: number;
    spinY: number;
    halfX: number;
    halfZ: number;
    wallHeight: number;
    wallThickness: number;
  };
  posts: {
    position: [number, number, number];
    rotationY: number;
    goalKey: string;
  };
  ball: {
    position: [number, number, number];
  };
  boxWX: number;
  boxWZ: number;
  halfX: number;
  halfZ: number;
  spawnY: number;
  startWX: number;
  startWZ: number;
  maxPull: number;
}

const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

const rotationPoint = new THREE.Vector2();
const ORIGIN = new THREE.Vector2(0, 0);

export function toWorld(
  centerX: number,
  centerZ: number,
  angle: number,
  localX: number,
  localZ: number,
): [number, number] {
  rotationPoint.set(localX, localZ).rotateAround(ORIGIN, -angle);
  return [centerX + rotationPoint.x, centerZ + rotationPoint.y];
}

export function computeGoalLayout({
  center,
  rotation,
  goalPlacement,
  goals,
  ballRadius,
  margin,
  boxCenter,
  ballStart,
  goalsOffset,
  goalsRotate,
}: GoalLayoutInputs): GoalLayout {
  const size = goals?.size ?? { width: 22, depth: 3.2, height: 1.5, minY: 0 };
  const halfX = (size.width * margin) / 2;
  const halfZ = (size.depth * margin) / 2;
  const wallHeight = size.height;
  const wallThickness = 0.3;
  const spawnY = ballRadius + 0.05;
  const restY = -size.minY;

  const cx = goalPlacement?.x ?? center.x;
  const cz = goalPlacement?.z ?? center.z;
  const spinY = ((goalPlacement?.rotation ?? rotation) * Math.PI) / 180;

  const [boxWX, boxWZ] = toWorld(cx, cz, spinY, boxCenter.x, boxCenter.z);

  const [goalWX, goalWZ] = toWorld(cx, cz, spinY, goalsOffset.x, goalsOffset.z);
  const goalPos: [number, number, number] = [goalWX, restY, goalWZ];
  const goalRotY = spinY + (goalsRotate * Math.PI) / 180;
  const goalKey = goalsOffset.x + "_" + goalsOffset.z + "_" + goalsRotate;

  const sx = clamp(ballStart.x, halfX - ballRadius - wallThickness);
  const sz = clamp(ballStart.z, halfZ - ballRadius - wallThickness);
  const [startWX, startWZ] = toWorld(boxWX, boxWZ, spinY, sx, sz);
  const maxPull = Math.max(halfX, halfZ);

  return {
    pitch: { boxWX, boxWZ, spinY, halfX, halfZ, wallHeight, wallThickness },
    posts: { position: goalPos, rotationY: goalRotY, goalKey },
    ball: { position: [startWX, spawnY, startWZ] },
    boxWX,
    boxWZ,
    halfX,
    halfZ,
    spawnY,
    startWX,
    startWZ,
    maxPull,
  };
}
