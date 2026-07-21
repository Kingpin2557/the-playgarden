import type { Object3D } from "three";

// Tiny escape hatches outside React state, for values written every frame (or
// from render) and read elsewhere in the scene — going through props/state
// here would mean a re-render per frame.

// Shared day/night level so the R3F scene lights can follow the sky cycle.
// dayAmount: 1 = full daylight, 0 = night. gloom: 0..1 cloud/thunder darkening.
export const dayNight = { dayAmount: 1, gloom: 0 };

// The ground mesh: set once by PlantInstances, read every frame by
// usePoiPresentation to snap each PoI model onto it.
let ground: Object3D | null = null;

export function setGround(mesh: Object3D | null) {
  ground = mesh;
}

export function getGround() {
  return ground;
}
