export const COORDS = {
  longitude: 3.7144315474037364,
  latitude: 51.063943600278726,
};

export const CAMERA_START = { zoom: 24, pitch: 74, bearing: 142 };

export const GLOBAL_MIN_ZOOM = 15;
export const GLOBAL_MAX_ZOOM = 20;
export const FOCUS_MAX_ZOOM = 22;
export const FOCUS_PAN_METRES = 12;

export const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

export interface PoiConfig {
  name: string;
  url: string;
  folder: string;
  position: { x: number; y: number };
  rotation: number;
  view: { zoom: number; pitch: number; bearing: number };
  game?: boolean;
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

export interface NatureModel {
  url: string;
  nodeName: string;
  count: number;
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