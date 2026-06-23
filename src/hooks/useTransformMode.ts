import { useEffect, useState } from "react";

type Mode = "translate" | "rotate" | "scale";

export function useTransformMode(initial: Mode = "translate") {
  const [mode, setMode] = useState<Mode>(initial);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "g":
          setMode("translate");
          break;
        case "r":
          setMode("rotate");
          break;
        case "s":
          setMode("scale");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { mode, setMode };
}
