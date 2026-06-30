import "maplibre-gl/dist/maplibre-gl.css";
import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Leva } from "leva";

import App from "./App.tsx";

import MapScene from "./components/MapScene.tsx";

const isDev = false;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Leva hidden={isDev} />
    <App />
    <MapScene />
  </StrictMode>,
);
