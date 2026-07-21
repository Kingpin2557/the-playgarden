import { useEffect, useRef, useState } from "react";

import "./Onboarding.css";
import { useAppStore } from "../../store/appStore";
import { usePoiStore } from "../../store/poiStore";
import { useGestureDetector, type Gesture } from "../../hooks/useGestureDetector";
import MouseIcon from "../MouseIcon/MouseIcon";
import ClickIcon from "../ClickIcon/ClickIcon";

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
    button: "click",
    title: "Points of interest",
    hint: "Left-click the glowing sign to fly over and explore it.",
    detect: "explore",
  },
] as const;

const CELEBRATE_MS = 800;

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
  const current = STEPS[step];
  const detecting = active && !celebrating; // paused mid-celebration

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
  // "explore" has nothing to watch on the map — it's handled below instead.
  useGestureDetector(
    current.detect === "explore" ? null : (current.detect as Gesture),
    detecting,
    completeStep,
  );

  // The "explore" step completes when a point of interest gets focused.
  useEffect(() => {
    if (detecting && current.detect === "explore" && focus !== null) {
      completeStep();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detecting, current.detect, focus]);

  // Pulse one PoI while on the "explore" step so it's obvious what to click.
  useEffect(() => {
    setHintPoi(detecting && current.detect === "explore" ? HIGHLIGHT_POI : null);
    return () => setHintPoi(null);
  }, [detecting, current.detect, setHintPoi]);

  if (!active) return null;

  return (
    <div className="c-onboarding">
      <div className="c-onboarding__card">
        <div className="c-onboarding__count">
          Step {step + 1} of {STEPS.length}
        </div>

        <span className="c-onboarding__icon" data-done={celebrating || undefined}>
          {celebrating ? (
            "✓"
          ) : current.button === "click" ? (
            <ClickIcon />
          ) : (
            <MouseIcon highlight={current.button} />
          )}
        </span>

        <div className="c-onboarding__title">
          {celebrating ? "Nice!" : current.title}
        </div>
        <p className="c-onboarding__hint">
          {celebrating ? "Great — here comes the next one." : current.hint}
        </p>

        <div className="c-onboarding__dots">
          {STEPS.map((item, index) => (
            <span
              key={item.title}
              className="c-onboarding__dot"
              data-on={index === step || undefined}
              data-past={index < step || undefined}
            />
          ))}
        </div>

        <button className="c-onboarding__skip" onClick={finishOnboarding}>
          Skip tour
        </button>
      </div>
    </div>
  );
}

export default Onboarding;
