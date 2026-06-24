import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Map } from "react-map-gl/maplibre";
import { Canvas } from "react-three-map/maplibre";
import { Leva } from "leva";
import "maplibre-gl/dist/maplibre-gl.css";

import "./index.css";
import Buildings from "./components/Buildings.tsx";
import Experience from "./experience/Experience.tsx";
import App from "./App.tsx";

const COORDS = { longitude: 3.7148832892004333, latitude: 51.06450815935309 };

const isDev = false;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Leva hidden={isDev} />
    <App />
    <Map
      initialViewState={{ ...COORDS, zoom: 18, pitch: 60 }}
      mapStyle={`https://api.maptiler.com/maps/base-v4/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`}
      style={{ width: "100vw", height: "100vh" }}
    >
      <Buildings />

      <Canvas {...COORDS}>
        <Experience isDev={isDev} />
      </Canvas>
    </Map>
  </StrictMode>,
);
