import { useEffect, useRef, useState } from "react";

import "./Onboarding.css";
import { useAppStore } from "../../store/appStore";
import { usePoiStore } from "../../store/poiStore";

// Which PoI the onboarding pulses during the "explore" step (must be a real name).
const HIGHLIGHT_POI = "Goals";

const STEPS = [
  {
    button: "scroll",
    title: "Zoom",
    hint: "Scroll your mouse wheel to zoom in and out.",
    detect: "zoom",
  },
  {
    button: "left",
    title: "Move around",
    hint: "Hold the left mouse button and drag to move.",
    detect: "pan",
  },
  {
    button: "right",
    title: "Rotate",
    hint: "Hold the right mouse button and drag to spin.",
    detect: "rotate",
  },
  {
    button: "left",
    title: "Points of interest",
    hint: "Left-click the glowing sign to fly over and explore it.",
    detect: "explore",
  },
] as const;

// A mouse with one part highlighted, so it's obvious which button to press.
function MouseIcon({ highlight }: { highlight: "scroll" | "left" | "right" }) {
  return (
    <svg className="onboarding__mouse" viewBox="0 0 48 64" aria-hidden="true">
      <rect
        x="8"
        y="4"
        width="32"
        height="56"
        rx="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      {highlight === "left" && (
        <path
          className="onboarding__mouse-fill"
          d="M8 28 L8 20 A16 16 0 0 1 24 4 L24 28 Z"
        />
      )}
      {highlight === "right" && (
        <path
          className="onboarding__mouse-fill"
          d="M40 28 L40 20 A16 16 0 0 0 24 4 L24 28 Z"
        />
      )}
      {highlight === "scroll" && (
        <rect
          className="onboarding__mouse-fill"
          x="21"
          y="10"
          width="6"
          height="12"
          rx="3"
        />
      )}
      <line x1="8" y1="28" x2="40" y2="28" stroke="currentColor" strokeWidth="3" />
      <line x1="24" y1="4" x2="24" y2="28" stroke="currentColor" strokeWidth="3" />
      <rect
        x="21"
        y="10"
        width="6"
        height="12"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
    </svg>
  );
}

const CELEBRATE_MS = 800;
const DRAG_THRESHOLD = 40;

function Onboarding() {
  const entered = useAppStore((state) => state.entered);
  const onboarded = useAppStore((state) => state.onboarded);
  const finishOnboarding = useAppStore((state) => state.finishOnboarding);
  const setHintPoi = useAppStore((state) => state.setHintPoi);
  const focus = usePoiStore((state) => state.focus);

  const [step, setStep] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const busyRef = useRef(false);

  const active = entered && !onboarded;

  // Flash a "done" state, then move to the next step (or finish the tour).
  function completeStep() {
    if (busyRef.current) return;
    busyRef.current = true;
    setCelebrating(true);
    window.setTimeout(() => {
      busyRef.current = false;
      setCelebrating(false);
      setStep((prev) => {
        const next = prev + 1;
        if (next >= STEPS.length) {
          finishOnboarding();
          return prev;
        }
        return next;
      });
    }, CELEBRATE_MS);
  }

  // Watch the real map inputs for the current step and auto-advance.
  useEffect(() => {
    if (!active || celebrating) return;
    const detect = STEPS[step].detect;

    if (detect === "zoom") {
      const onWheel = () => completeStep();
      window.addEventListener("wheel", onWheel, { passive: true });
      return () => window.removeEventListener("wheel", onWheel);
    }

    // pan = left drag, rotate = right drag (or ctrl + left drag).
    if (detect === "pan" || detect === "rotate") {
      let startX = 0;
      let startY = 0;
      let tracking = false;
      const onDown = (event: PointerEvent) => {
        const isRotate = event.button === 2 || (event.button === 0 && event.ctrlKey);
        const isPan = event.button === 0 && !event.ctrlKey;
        tracking = detect === "rotate" ? isRotate : isPan;
        startX = event.clientX;
        startY = event.clientY;
      };
      const onMove = (event: PointerEvent) => {
        const moved = Math.hypot(event.clientX - startX, event.clientY - startY);
        if (tracking && moved > DRAG_THRESHOLD) completeStep();
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
    // "explore" is handled by the focus effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step, celebrating]);

  // The "explore" step completes when a point of interest gets focused.
  useEffect(() => {
    if (!active || celebrating) return;
    if (STEPS[step].detect === "explore" && focus !== null) completeStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step, celebrating, focus]);

  // Pulse one PoI while on the "explore" step so it's obvious what to click.
  useEffect(() => {
    const onExplore =
      active && !celebrating && STEPS[step].detect === "explore";
    setHintPoi(onExplore ? HIGHLIGHT_POI : null);
    return () => setHintPoi(null);
  }, [active, step, celebrating, setHintPoi]);

  if (!active) return null;

  const current = STEPS[step];

  return (
    <div className="onboarding">
      <div className="onboarding__card">
        <div className="onboarding__count">
          Step {step + 1} of {STEPS.length}
        </div>

        <span
          className={
            celebrating
              ? "onboarding__icon onboarding__icon--done"
              : "onboarding__icon"
          }
        >
          {celebrating ? "✓" : <MouseIcon highlight={current.button} />}
        </span>

        <div className="onboarding__title">
          {celebrating ? "Nice!" : current.title}
        </div>
        <p className="onboarding__hint">
          {celebrating ? "Great — here comes the next one." : current.hint}
        </p>

        <div className="onboarding__dots">
          {STEPS.map((item, index) => (
            <span
              key={item.title}
              className={
                index === step
                  ? "onboarding__dot onboarding__dot--on"
                  : index < step
                    ? "onboarding__dot onboarding__dot--past"
                    : "onboarding__dot"
              }
            />
          ))}
        </div>

        <button className="onboarding__skip" onClick={finishOnboarding}>
          Skip tour
        </button>
      </div>
    </div>
  );
}

export default Onboarding;
