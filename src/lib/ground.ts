import type { Object3D } from "three";

let ground: Object3D | null = null;

export function setGround(mesh: Object3D | null) {
  ground = mesh;
}

export function getGround() {
  return ground;
}
