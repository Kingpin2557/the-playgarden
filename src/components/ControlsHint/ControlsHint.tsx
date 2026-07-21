import "./ControlsHint.css";
import MouseIcon, { type MouseButton } from "../MouseIcon/MouseIcon";
import ClickIcon from "../ClickIcon/ClickIcon";

export type ControlHint =
  | { icon: "camera"; button: MouseButton; label: string }
  | { icon: "click"; drag?: boolean; label: string };

interface ControlsHintProps {
  actions: ControlHint[];
}

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
