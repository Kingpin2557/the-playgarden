import { useState } from "react";
import { useProgress } from "@react-three/drei";

import "./WelcomeScreen.css";
import { useAppStore } from "../../store/appStore";

function WelcomeScreen() {
  const entered = useAppStore((state) => state.entered);
  const enter = useAppStore((state) => state.enter);
  const { progress } = useProgress();
  const [audioAllowed, setAudioAllowed] = useState(true);

  if (entered) return null;

  const ready = progress >= 100;

  return (
    <div className="c-welcome-screen">
      <div className="c-welcome-screen__content">
        <h1 className="c-welcome-screen__title">The Playgarden</h1>
        <p className="c-welcome-screen__subtitle">Ontdek de speeltuin.</p>

        <div className="c-welcome-screen__bar">
          <div
            className="c-welcome-screen__bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="c-welcome-screen__progress">{Math.round(progress)}%</div>

        <label className="c-welcome-screen__audio">
          <input
            type="checkbox"
            className="c-welcome-screen__checkbox"
            checked={audioAllowed}
            onChange={(event) => setAudioAllowed(event.target.checked)}
          />
          <span className="c-welcome-screen__checkbox-box">
            <svg
              className="c-welcome-screen__checkbox-tick"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M5 13l4 4L19 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="c-welcome-screen__audio-text">Speel achtergrondgeluid af</span>
        </label>

        <button
          className="c-welcome-screen__enter"
          disabled={!ready}
          onClick={() => enter(audioAllowed)}
        >
          {ready ? "Betreden" : "Laden…"}
        </button>
      </div>
    </div>
  );
}

export default WelcomeScreen;
