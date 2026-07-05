// Every point of interest lives here: its model, placement, and the start
// viewpoint the camera flies to (zoom/pitch/bearing). Tune each one live in its
// Leva folder — those sliders start from the values below — then paste the
// numbers back here. A per-PoI bearing lets you angle each shot to dodge trees.
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
    name: "Swing",
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
