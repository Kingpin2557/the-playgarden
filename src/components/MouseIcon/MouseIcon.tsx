import "./MouseIcon.css";

export type MouseButton = "scroll" | "left" | "right";

interface MouseIconProps {
  highlight: MouseButton;
  className?: string;
}

// A mouse with one part highlighted, so it's obvious which button to press.
// Shared by the onboarding tour and the small controls hint — pass a
// className to resize it for wherever it's used.
function MouseIcon({ highlight, className }: MouseIconProps) {
  return (
    <svg
      className={["c-mouse-icon", className].filter(Boolean).join(" ")}
      viewBox="0 0 48 64"
      aria-hidden="true"
    >
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
          className="c-mouse-icon__fill"
          d="M8 28 L8 20 A16 16 0 0 1 24 4 L24 28 Z"
        />
      )}
      {highlight === "right" && (
        <path
          className="c-mouse-icon__fill"
          d="M40 28 L40 20 A16 16 0 0 0 24 4 L24 28 Z"
        />
      )}
      {highlight === "scroll" && (
        <rect
          className="c-mouse-icon__fill"
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

export default MouseIcon;
