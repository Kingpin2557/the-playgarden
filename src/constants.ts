// One home for the tunable constants used across the app — the values Leva
// starts its sliders from, the points of interest, and the scatter models.
// Tune live in the Leva panels, then paste the numbers back here.

export const COORDS = {
  longitude: 3.7144315474037364,
  latitude: 51.063943600278726,
};

// --- Camera / map -----------------------------------------------------------

export const CAMERA_START = { zoom: 24, pitch: 74, bearing: 142 };

export const GLOBAL_MIN_ZOOM = 15;
export const GLOBAL_MAX_ZOOM = 20; // global zoom-in stops here
export const FOCUS_MAX_ZOOM = 22; // the PoI fly-to needs to go closer than global
export const FOCUS_PAN_METRES = 12; // tight leeway around a focused PoI, in metres

export const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// --- Points of interest -----------------------------------------------------

export interface PoiConfig {
  name: string; // shown on the sign + used as the store key
  url: string; // model file
  folder: string; // Leva folder (keep as the model/node name)
  position: { x: number; y: number };
  rotation: number;
  view: { zoom: number; pitch: number; bearing: number };
  game?: boolean; // spawn the kick-about ball game when this PoI is focused
}

export const POIS: PoiConfig[] = [
  {
    name: "Goals",
    url: "/models/goals.glb",
    folder: "Goal",
    position: { x: -15.99914550781255, y: -76.99993896484375 },
    rotation: 14,
    view: { zoom: 21.5, pitch: 72, bearing: 253 },
    game: true,
  },
  {
    name: "The Seesaw",
    url: "/models/whip.glb",
    folder: "Seesaw",
    position: { x: -13.332504272460938, y: -47.00018310546875 },
    rotation: 38,
    view: { zoom: 23.5, pitch: 72, bearing: 235 },
  },
  {
    name: "The Swing",
    url: "/models/swing.glb",
    folder: "Swing",
    position: { x: -19.9991455078125, y: -156.99993896484375 },
    rotation: 38,
    view: { zoom: 21.5, pitch: 69, bearing: 91 },
  },
  {
    name: "Climbhouse",
    url: "/models/climbhouse.glb",
    folder: "Climbhouse",
    position: { x: -43.9991455078125, y: -141.99993896484375 },
    rotation: 38,
    view: { zoom: 21.5, pitch: 72, bearing: 195 },
  },
];

// --- Nature scatter ---------------------------------------------------------

export interface NatureModel {
  url: string; // scatter model file
  nodeName: string; // groups models under one Density slider
  count: number; // instances scattered across the ground
}

export const MY_NATURE: NatureModel[] = [
  { url: "/scatter/plant.glb", nodeName: "plants", count: 50000 },
  { url: "/scatter/tree.glb", nodeName: "trees", count: 50 },
  { url: "/scatter/mushroom.glb", nodeName: "mushrooms", count: 50 },
  { url: "/scatter/flower.glb", nodeName: "flowers", count: 100 },
  { url: "/scatter/flower2.glb", nodeName: "flowers", count: 100 },
  { url: "/scatter/trunk.glb", nodeName: "trunks", count: 6 },
];

export const NATURE_DENSITY_DEFAULT = 1;

// --- Goals mini-game (Ball Game Leva folder) --------------------------------

export const BALL_GAME = {
  ballRadius: 0.4,
  kick: 2.5,
  margin: 1.2,
  boxCenter: { x: -4, z: -5.7 },
  showCenter: false,
  showGoals: false,
  ballStart: { x: 0, z: 0 },
  goalsOffset: { x: 0, z: 0 },
  goalsRotate: -14,
  debug: false,
}