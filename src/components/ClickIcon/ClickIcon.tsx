import "./ClickIcon.css";

interface ClickIconProps {
  drag?: boolean;
  className?: string;
}

function ClickIcon({ drag, className }: ClickIconProps) {
  return (
    <svg
      className={["c-click-icon", className].filter(Boolean).join(" ")}
      viewBox="0 0 48 64"
      aria-hidden="true"
    >
      <path
        d="M14 8 L14 38 L20 32 L25 42 L29 40 L24 30 L32 30 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path className="c-click-icon__ping" d="M33 12 Q37 15 35 21" fill="none" strokeWidth="2.5" strokeLinecap="round" />
      <path className="c-click-icon__ping" d="M38 8 Q43 13 41 22" fill="none" strokeWidth="2.5" strokeLinecap="round" />

      {drag && (
        <g className="c-click-icon__drag" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="14" y1="50" x2="30" y2="50" />
          <path d="M25 45 L30 50 L25 55" />
        </g>
      )}
    </svg>
  );
}

export default ClickIcon;
