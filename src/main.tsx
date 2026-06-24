import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Map } from "react-map-gl/maplibre";
import { Canvas } from "react-three-map/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import "./index.css";
import Experience from "./experience/Experience.tsx";

// The exact spot where your Experience lives AND where the camera starts.
const COORDS = { longitude: 3.7174, latitude: 51.0543 };

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Map
      initialViewState={{ ...COORDS, zoom: 18, pitch: 60 }}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      style={{ width: "100vw", height: "100vh" }}
    >
      <Canvas {...COORDS}>
        <Experience />
      </Canvas>
    </Map>
  </StrictMode>,
);
