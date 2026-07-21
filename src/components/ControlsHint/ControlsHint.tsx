import "./ControlsHint.css";
import MouseIcon, { type MouseButton } from "../MouseIcon/MouseIcon";
import ClickIcon from "../ClickIcon/ClickIcon";

// Two kinds of action: a camera move (drag/scroll on empty space — shown as
// a mouse with a button highlighted) or a click on something in the scene, a
// button or the ball (shown as a pointer, optionally with a drag arrow).
export type ControlHint =
  | { icon: "camera"; button: MouseButton; label: string }
  | { icon: "click"; drag?: boolean; label: string };

interface ControlsHintProps {
  actions: ControlHint[];
}

// A small "what can I do right now" legend, bottom-right — the same icon
// style as the onboarding tour, just compact enough to sit in a corner. Pass
// in whichever actions apply to the current state; it renders whatever list
// it's given.
function ControlsHint({ actions }: ControlsHintProps) {
  if (actions.length === 0) return null;

  return (
    <div className="c-controls-hint u-fit">
      {actions.map((action) => (
        <div className="c-controls-hint__row" key={action.label}>
          <span className="c-controls-hint__icon-box">
            {action.icon === "camera" ? (
              <MouseIcon highlight={action.button} />
            ) : (
              <ClickIcon drag={action.drag} />
            )}
          </span>
          <span className="c-controls-hint__label">{action.label}</span>
        </div>
      ))}
    </div>
  );
}

export default ControlsHint;
