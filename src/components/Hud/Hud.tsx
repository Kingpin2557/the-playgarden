import WeatherWidget from "../WeatherWidget/WeatherWidget";
import PoiInfo from "../PoiInfo/PoiInfo";
import Onboarding from "../Onboarding/Onboarding";
import GoalScore from "../GoalScore/GoalScore";
import GoalHud from "../GoalHud/GoalHud";
import ControlsHint, { type ControlHint } from "../ControlsHint/ControlsHint";
import { useAppStore } from "../../store/appStore";
import { usePoiStore } from "../../store/poiStore";
import { useGameStore } from "../../store/gameStore";

// What you can currently do — mirrors the pan/zoom/rotate rules in App.tsx.
// Rotate stays available the whole time you're focused on a PoI; pan only
// unlocks once the goals game has actually started.
function resolveControlHints(activeName: string | null, playing: boolean): ControlHint[] {
  switch (true) {
    case playing:
      return [
        { icon: "click", drag: true, label: "Drag the ball to aim & shoot" },
        { icon: "camera", button: "right", label: "Rotate the view" },
      ];
    case activeName === "Goals":
      return [
        { icon: "camera", button: "right", label: "Rotate the view" },
        { icon: "click", label: "Press play to start" },
        { icon: "click", label: "Back to the park" },
      ];
    case activeName !== null:
      return [
        { icon: "camera", button: "right", label: "Rotate the view" },
        { icon: "click", label: "Back to the park" },
      ];
    default:
      return [
        { icon: "camera", button: "scroll", label: "Zoom" },
        { icon: "camera", button: "left", label: "Move around" },
        { icon: "camera", button: "right", label: "Rotate" },
        { icon: "click", label: "Explore a point of interest" },
      ];
  }
}

// The 2D overlay drawn on top of the map/3D scene — weather, PoI info, the
// onboarding tour, and the goal-game HUD.
function Hud() {
  const onboarded = useAppStore((state) => state.onboarded);
  const activeName = usePoiStore((state) => state.activeName);
  const playing = useGameStore((state) => state.playing);
  const inGoals = activeName === "Goals";

  return (
    <>
      {onboarded && (
        <div className="o-overlay-grid">
          <WeatherWidget />
          {inGoals && playing && <GoalScore />}
          <PoiInfo />
          {inGoals && <GoalHud />}
          <ControlsHint actions={resolveControlHints(activeName, playing)} />
        </div>
      )}
      <Onboarding />
    </>
  );
}

export default Hud;
