import { useState } from "react";

import "./NavGuide.css";

const STEPS = [
  { icon: "🖱️", title: "Zoom", text: "Scroll to zoom the park in and out." },
  { icon: "🖐️", title: "Look around", text: "Drag to pan and rotate the view." },
  { icon: "👆", title: "Explore", text: "Click a sign to fly to that spot." },
  { icon: "←", title: "Go back", text: "Press Back to return to the park." },
];

function NavGuide() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  if (done) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="nav-guide">
      <div className="nav-guide__head">
        <span className="nav-guide__icon">{current.icon}</span>
        <div>
          <div className="nav-guide__title">{current.title}</div>
          <div className="nav-guide__count">
            Step {step + 1} of {STEPS.length}
          </div>
        </div>
      </div>

      <p className="nav-guide__text">{current.text}</p>

      <div className="nav-guide__dots">
        {STEPS.map((item, index) => (
          <span
            key={item.title}
            className={
              index === step
                ? "nav-guide__dot nav-guide__dot--on"
                : "nav-guide__dot"
            }
          />
        ))}
      </div>

      <div className="nav-guide__actions">
        <button className="nav-guide__skip" onClick={() => setDone(true)}>
          Skip
        </button>
        <button
          className="nav-guide__next"
          onClick={() => (isLast ? setDone(true) : setStep(step + 1))}
        >
          {isLast ? "Got it" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default NavGuide;
