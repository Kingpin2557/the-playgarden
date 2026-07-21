import type { Object3D } from "three";

export const dayNight = { dayAmount: 1, gloom: 0 };

let ground: Object3D | null = null;

export function setGround(mesh: Object3D | null) {
  ground = mesh;
}

export function getGround() {
  return ground;
}
