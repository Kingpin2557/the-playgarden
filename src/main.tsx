import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";

import "./index.css";
import App from "./App.tsx";
import Experience from "./experience/Experience.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Canvas
      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [3, 2, 6],
      }}
    >
      <Experience />
    </Canvas>
  </StrictMode>,
);
