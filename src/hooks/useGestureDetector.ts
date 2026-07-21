import { useEffect } from "react";

export type Gesture = "zoom" | "pan" | "rotate";

const DRAG_THRESHOLD = 40;

export function useGestureDetector(
  gesture: Gesture | null,
  active: boolean,
  onDetected: () => void,
) {
  useEffect(() => {
    if (!active || !gesture) return;

    switch (gesture) {
      case "zoom": {
        const onWheel = () => onDetected();
        window.addEventListener("wheel", onWheel, { passive: true });
        return () => window.removeEventListener("wheel", onWheel);
      }

      case "pan":
      case "rotate": {
        let startX = 0;
        let startY = 0;
        let tracking = false;
        const onDown = (event: PointerEvent) => {
          const isRotate =
            event.button === 2 || (event.button === 0 && event.ctrlKey);
          const isPan = event.button === 0 && !event.ctrlKey;
          tracking = gesture === "rotate" ? isRotate : isPan;
          startX = event.clientX;
          startY = event.clientY;
        };
        const onMove = (event: PointerEvent) => {
          const moved = Math.hypot(event.clientX - startX, event.clientY - startY);
          if (tracking && moved > DRAG_THRESHOLD) onDetected();
        };
        const onUp = () => {
          tracking = false;
        };
        window.addEventListener("pointerdown", onDown);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        return () => {
          window.removeEventListener("pointerdown", onDown);
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gesture, active]);
}
